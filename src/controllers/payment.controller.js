import crypto from "crypto";

import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import Table from "../models/table.model.js";
import { getRazorpayCredentials, getRazorpayInstance } from "../config/razorpay.js";

const ONLINE_PAYMENT_METHODS = ["card", "debit_card", "credit_card", "upi", "wallet"];

const RAZORPAY_CHECKOUT_METHOD = {
  card: "card",
  debit_card: "card",
  credit_card: "card",
  upi: "upi",
  wallet: "wallet"
};

const toPaise = (amount) => Math.round(Number(amount) * 100);

const generateReference = (prefix) => {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${Date.now()}-${randomPart}`;
};

const safeCompare = (firstValue, secondValue) => {
  if (!firstValue || !secondValue) return false;

  const firstBuffer = Buffer.from(firstValue);
  const secondBuffer = Buffer.from(secondValue);

  if (firstBuffer.length !== secondBuffer.length) return false;

  return crypto.timingSafeEqual(firstBuffer, secondBuffer);
};

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

const getOrderOrFail = async (orderId, res) => {
  const order = await Order.findById(orderId)
    .populate("customerId", "name email phone")
    .populate("tableId", "tableNumber");

  if (!order) {
    sendError(res, 404, "Order not found");
    return null;
  }

  return order;
};

const getPaymentAmount = (order, requestedAmount) => {
  const amount = requestedAmount ?? order.totalAmount;
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

  return numericAmount;
};

const markOrderAsPaid = async (order) => {
  order.status = "completed";
  await order.save();

  if (order.tableId) {
    const tableId = order.tableId._id || order.tableId;

    await Table.findByIdAndUpdate(tableId, {
      status: "vacant",
      currentOrderId: null,
      occupiedSince: null
    });
  }
};

const buildConfirmation = (payment, order) => ({
  confirmationNumber: payment.confirmationNumber,
  receiptNumber: payment.receiptNumber,
  orderId: order._id,
  orderNumber: order.orderNumber,
  amount: payment.amount,
  currency: payment.currency,
  paymentMethod: payment.paymentMethod,
  paymentGateway: payment.paymentGateway,
  transactionId: payment.transactionId,
  status: payment.status,
  paidAt: payment.paidAt,
  table: order.tableId,
  customer: order.customerId
});

const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const { keySecret } = getRazorpayCredentials();
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return safeCompare(expectedSignature, razorpaySignature);
};

export const recordCashPayment = async (req, res) => {
  try {
    const { orderId, amount, notes = "" } = req.body;

    const order = await getOrderOrFail(orderId, res);
    if (!order) return;

    const paymentAmount = getPaymentAmount(order, amount);
    const now = new Date();

    const payment = await Payment.create({
      orderId: order._id,
      branchId: order.branchId,
      amount: paymentAmount,
      currency: "INR",
      paymentMethod: "cash",
      paymentGateway: "cash",
      transactionId: generateReference("CASH"),
      confirmationNumber: generateReference("PAY"),
      receiptNumber: generateReference("RCPT"),
      status: "success",
      paidAt: now,
      notes
    });

    await markOrderAsPaid(order);

    res.status(201).json({
      success: true,
      message: "Cash payment recorded successfully",
      data: {
        payment,
        confirmation: buildConfirmation(payment, order)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const {
      orderId,
      amount,
      paymentMethod,
      currency = "INR",
      notes = ""
    } = req.body;

    if (!ONLINE_PAYMENT_METHODS.includes(paymentMethod)) {
      return sendError(res, 400, "Payment method must be card, debit_card, credit_card, upi, or wallet");
    }

    const order = await getOrderOrFail(orderId, res);
    if (!order) return;

    const paymentAmount = getPaymentAmount(order, amount);
    const gatewayAmount = toPaise(paymentAmount);
    const receiptNumber = generateReference("RCPT");
    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: gatewayAmount,
      currency,
      receipt: receiptNumber,
      notes: {
        appOrderId: order._id.toString(),
        orderNumber: order.orderNumber,
        branchId: order.branchId.toString(),
        paymentMethod
      }
    });

    const payment = await Payment.create({
      orderId: order._id,
      branchId: order.branchId,
      amount: paymentAmount,
      currency,
      paymentMethod,
      paymentGateway: "razorpay",
      gatewayAmount,
      razorpayOrderId: razorpayOrder.id,
      confirmationNumber: generateReference("PAY"),
      receiptNumber,
      status: "pending",
      notes
    });

    const { keyId } = getRazorpayCredentials();

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        payment,
        razorpayOrder,
        checkoutOptions: {
          key: keyId,
          amount: gatewayAmount,
          currency,
          name: process.env.RAZORPAY_BUSINESS_NAME || "Handheld Ordering System",
          description: `Payment for order ${order.orderNumber}`,
          order_id: razorpayOrder.id,
          method: RAZORPAY_CHECKOUT_METHOD[paymentMethod],
          prefill: {
            name: order.customerId?.name || "",
            email: order.customerId?.email || "",
            contact: order.customerId?.phone || ""
          },
          notes: {
            appOrderId: order._id.toString(),
            paymentId: payment._id.toString()
          },
          theme: {
            color: process.env.RAZORPAY_THEME_COLOR || "#3399cc"
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return sendError(res, 400, "Razorpay order id, payment id and signature are required");
    }

    const payment = await Payment.findOne({ razorpayOrderId });

    if (!payment) {
      return sendError(res, 404, "Payment transaction not found");
    }

    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      payment.status = "failed";
      payment.failureReason = "Invalid Razorpay signature";
      await payment.save();

      return sendError(res, 400, "Invalid payment signature");
    }

    const razorpay = getRazorpayInstance();
    const gatewayPayment = await razorpay.payments.fetch(razorpayPaymentId);
    const order = await Order.findById(payment.orderId)
      .populate("customerId", "name email phone")
      .populate("tableId", "tableNumber");

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.transactionId = razorpayPaymentId;
    payment.status = gatewayPayment.status === "captured"
      ? "success"
      : "pending";
    payment.paidAt = payment.status === "success" ? new Date() : null;
    payment.paymentDetails = {
      razorpayStatus: gatewayPayment.status,
      method: gatewayPayment.method,
      cardId: gatewayPayment.card_id,
      bank: gatewayPayment.bank,
      wallet: gatewayPayment.wallet,
      vpa: gatewayPayment.vpa,
      email: gatewayPayment.email,
      contact: gatewayPayment.contact
    };

    await payment.save();

    if (payment.status === "success" && order) {
      await markOrderAsPaid(order);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        payment,
        confirmation: order ? buildConfirmation(payment, order) : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return sendError(res, 500, "Razorpay webhook secret is not configured");
    }

    const rawBody = req.rawBody?.toString("utf8") || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const isValidSignature = safeCompare(expectedSignature, signature);

    if (!isValidSignature) {
      return sendError(res, 400, "Invalid webhook signature");
    }

    const event = req.body;
    const gatewayPayment = event.payload?.payment?.entity;

    if (!gatewayPayment?.order_id) {
      return res.status(200).json({
        success: true,
        message: "Webhook ignored"
      });
    }

    const payment = await Payment.findOne({ razorpayOrderId: gatewayPayment.order_id });

    if (!payment) {
      return res.status(200).json({
        success: true,
        message: "Payment transaction not found locally"
      });
    }

    if (event.event === "payment.captured" || event.event === "order.paid") {
      payment.status = "success";
      payment.paidAt = gatewayPayment.created_at
        ? new Date(gatewayPayment.created_at * 1000)
        : new Date();
    }

    if (event.event === "payment.failed") {
      payment.status = "failed";
      payment.failureReason = gatewayPayment.error_description || gatewayPayment.error_reason || "Payment failed";
    }

    payment.razorpayPaymentId = gatewayPayment.id || payment.razorpayPaymentId;
    payment.transactionId = gatewayPayment.id || payment.transactionId;
    payment.paymentDetails = {
      ...payment.paymentDetails,
      razorpayStatus: gatewayPayment.status,
      method: gatewayPayment.method,
      bank: gatewayPayment.bank,
      wallet: gatewayPayment.wallet,
      vpa: gatewayPayment.vpa,
      email: gatewayPayment.email,
      contact: gatewayPayment.contact,
      webhookEvent: event.event
    };

    await payment.save();

    if (payment.status === "success") {
      const order = await Order.findById(payment.orderId);
      if (order) {
        await markOrderAsPaid(order);
      }
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const {
      orderId,
      branchId,
      status,
      paymentMethod
    } = req.query;

    const filter = {};

    if (orderId) filter.orderId = orderId;
    if (branchId) filter.branchId = branchId;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const payments = await Payment.find(filter)
      .populate("orderId", "orderNumber status totalAmount")
      .populate("branchId", "branchName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPaymentsByOrder = async (req, res) => {
  try {
    const payments = await Payment.find({ orderId: req.params.orderId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPaymentConfirmation = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return sendError(res, 404, "Payment not found");
    }

    const order = await Order.findById(payment.orderId)
      .populate("customerId", "name email phone")
      .populate("tableId", "tableNumber");

    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    res.status(200).json({
      success: true,
      data: buildConfirmation(payment, order)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
