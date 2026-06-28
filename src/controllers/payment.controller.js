import Payment from "../models/payment.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  verifyRazorpaySignature
} from "../utils/razorpay.js";

// Create Payment
import Order from "../models/orders.model.js";
import Table from "../models/table.model.js";

const completePaidOrder = async (order) => {
  order.status = "completed";
  await order.save();

  await Table.findByIdAndUpdate(order.tableId, {
    status: "vacant",
    currentOrderId: null,
    occupiedSince: null
  });
};

export const createPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    amount,
    paymentMethod,
    transactionId,
    status,
    paidAt,
    branchId
  } = req.body;

  // Check duplicate transaction ID
  if (transactionId) {
    const existingTx = await Payment.findOne({ transactionId });

    if (existingTx) {
      return res.status(400).json(
        new ApiResponse(400, "Transaction ID already exists")
      );
    }
  }

  // Verify order exists
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json(
      new ApiResponse(404, "Order not found")
    );
  }

  // Create payment
  const payment = await Payment.create({
    orderId,
    amount,
    paymentMethod,
    transactionId,
    status,
    paidAt,
    branchId
  });

  // If payment is successful
  if (payment.status === "paid") {
    await completePaidOrder(order);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      "Payment registered successfully",
      payment
    )
  );
});

export const getRazorpayConfig = asyncHandler(async (req, res) => {
  const keyId = getRazorpayKeyId();

  if (!keyId) {
    return res.status(500).json(
      new ApiResponse(500, "Razorpay key ID is missing")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Razorpay config fetched successfully", { keyId })
  );
});

export const createRazorpayPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid order ID")
    );
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json(
      new ApiResponse(404, "Order not found")
    );
  }

  if (order.status === "completed") {
    return res.status(400).json(
      new ApiResponse(400, "Order is already completed")
    );
  }

  const existingPaidPayment = await Payment.findOne({
    orderId: order._id,
    status: "paid"
  });

  if (existingPaidPayment) {
    return res.status(400).json(
      new ApiResponse(400, "Payment is already completed for this order")
    );
  }

  const razorpayOrder = await createRazorpayOrder({
    amount: order.totalAmount,
    currency: "INR",
    receipt: `order_${order._id}`,
    notes: {
      orderId: String(order._id),
      branchId: String(order.branchId)
    }
  });

  const payment = await Payment.create({
    orderId: order._id,
    amount: order.totalAmount,
    paymentMethod: "razorpay",
    status: "pending",
    branchId: order.branchId,
    razorpayOrderId: razorpayOrder.id
  });

  return res.status(201).json(
    new ApiResponse(201, "Razorpay order created successfully", {
      keyId: getRazorpayKeyId(),
      payment,
      razorpayOrder
    })
  );
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const isValidSignature = verifyRazorpaySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature
  });

  if (!isValidSignature) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid Razorpay payment signature")
    );
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

  if (!payment) {
    return res.status(404).json(
      new ApiResponse(404, "Payment record not found")
    );
  }

  if (payment.status === "paid") {
    return res.status(200).json(
      new ApiResponse(200, "Payment already verified", payment)
    );
  }

  const order = await Order.findById(payment.orderId);

  if (!order) {
    return res.status(404).json(
      new ApiResponse(404, "Order not found")
    );
  }

  payment.status = "paid";
  payment.transactionId = razorpay_payment_id;
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.paidAt = new Date();
  await payment.save();

  await completePaidOrder(order);

  return res.status(200).json(
    new ApiResponse(200, "Razorpay payment verified successfully", payment)
  );
});

export const repairPaymentIndexes = asyncHandler(async (req, res) => {
  await Payment.collection.dropIndex("transactionId_1").catch((error) => {
    if (error.codeName !== "IndexNotFound") throw error;
  });

  await Payment.collection.dropIndex("razorpayOrderId_1").catch((error) => {
    if (error.codeName !== "IndexNotFound") throw error;
  });

  await Payment.collection.dropIndex("razorpayPaymentId_1").catch((error) => {
    if (error.codeName !== "IndexNotFound") throw error;
  });

  await Payment.syncIndexes();

  return res.status(200).json(
    new ApiResponse(200, "Payment indexes repaired successfully")
  );
});

// Get All Payments
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate("orderId")
    .populate("branchId", "branchName location");

  return res.status(200).json(
    new ApiResponse(200, "Payments fetched successfully", payments)
  );
});

// Get Payment By ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid payment ID")
    );
  }

  const payment = await Payment.findById(id)
    .populate("orderId")
    .populate("branchId", "branchName location");

  if (!payment) {
    return res.status(404).json(
      new ApiResponse(404, "Payment not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Payment fetched successfully", payment)
  );
});

// Update Payment
export const updatePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid payment ID")
    );
  }

  const payment = await Payment.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!payment) {
    return res.status(404).json(
      new ApiResponse(404, "Payment not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Payment updated successfully", payment)
  );
});

// Delete Payment
export const deletePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid payment ID")
    );
  }

  const payment = await Payment.findByIdAndDelete(id);

  if (!payment) {
    return res.status(404).json(
      new ApiResponse(404, "Payment not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Payment deleted successfully")
  );
});

// Get Payments by Order
export const getPaymentsByOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid order ID")
    );
  }

  const payments = await Payment.find({ orderId });

  return res.status(200).json(
    new ApiResponse(200, "Payments fetched successfully for the order", payments)
  );
});

// Get Payments by Branch
export const getPaymentsByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid branch ID")
    );
  }

  const payments = await Payment.find({ branchId });

  return res.status(200).json(
    new ApiResponse(200, "Payments fetched successfully for the branch", payments)
  );
});
