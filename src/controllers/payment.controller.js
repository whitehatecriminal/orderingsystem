import Payment from "../models/payment.model.js";
import Order from "../models/orders.model.js";
import Table from "../models/table.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";


import {
  createRazorpayOrder,
  getRazorpayKeyId,
  verifyRazorpaySignature
} from "../utils/razorpay.js";

const completePaidOrder = async (order) => {
  order.status = "completed";
  await order.save();

  await Table.findByIdAndUpdate(order.tableId, {
    status: "vacant",
    currentOrderId: null,
    occupiedSince: null
  });
};

//  CASH PAYMENT

export const createPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    amount,
    paymentMethod,
    transactionId,
    branchId
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Invalid Order ID"));
  }

  if (paymentMethod !== "cash") {
    return res.status(400).json(
      new ApiResponse(
        400,
        "Only cash payment is allowed here. Use Razorpay APIs for online payment."
      )
    );
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Order not found"));
  }

  const existingPayment = await Payment.findOne({
    orderId,
    status: "paid"
  });

  if (existingPayment) {
    return res.status(400).json(
      new ApiResponse(400, "Payment already completed")
    );
  }

  if (transactionId) {
    const tx = await Payment.findOne({ transactionId });

    if (tx) {
      return res.status(400).json(
        new ApiResponse(400, "Transaction ID already exists")
      );
    }
  }

  const payment = await Payment.create({
    orderId,
    amount,
    paymentMethod: "cash",
    paymentGateway: null,
    transactionId,
    branchId,
    status: "paid",
    paidAt: new Date()
  });

  await completePaidOrder(order);

  return res.status(201).json(
    new ApiResponse(
      201,
      "Cash payment completed successfully",
      payment
    )
  );
});


//  GET RAZORPAY KEY


export const getRazorpayConfig = asyncHandler(async (req, res) => {

  const keyId = getRazorpayKeyId();

  if (!keyId) {
    return res.status(500).json(
      new ApiResponse(500, "Razorpay Key ID missing")
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      "Razorpay config fetched successfully",
      { keyId }
    )
  );
});


//  CREATE RAZORPAY ORDER


export const createRazorpayPaymentOrder = asyncHandler(async (req, res) => {

  const {
    orderId,
    paymentMethod
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid order ID")
    );
  }

  if (!["upi", "card", "wallet"].includes(paymentMethod)) {
    return res.status(400).json(
      new ApiResponse(
        400,
        "Payment method must be upi, card or wallet"
      )
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
      new ApiResponse(400, "Order already completed")
    );
  }

  const existingPayment = await Payment.findOne({
    orderId,
    status: "paid"
  });


  if (existingPayment) {
    return res.status(400).json(
      new ApiResponse(400, "Payment already completed for this order"
      )
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
    paymentMethod,
    paymentGateway: "razorpay",
    status: "pending",
    branchId: order.branchId,
    razorpayOrderId: razorpayOrder.id
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      "Razorpay order created successfully",
      {
        keyId: getRazorpayKeyId(),
        payment,
        razorpayOrder
      }
    )
  );
});

//  VERIFY RAZORPAY PAYMENT

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json(
      new ApiResponse(400, "Missing Razorpay payment details")
    );
  }

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

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id
  });

  if (!payment) {
    return res.status(404).json(
      new ApiResponse(404, "Payment record not found")
    );
  }

  if (payment.status === "paid") {
    return res.status(200).json(
      new ApiResponse(
        200,
        "Payment already verified",
        payment
      )
    );
  }

  const duplicatePayment = await Payment.findOne({
    razorpayPaymentId: razorpay_payment_id
  });

  if (duplicatePayment) {
    return res.status(400).json(
      new ApiResponse(
        400,
        "Duplicate Razorpay payment detected"
      )
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
  payment.razorpayPaymentId = razorpay_payment_id
  payment.razorpaySignature = razorpay_signature;
  payment.paidAt = new Date();

  await payment.save();

  await completePaidOrder(order);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Payment verified successfully",
      payment
    )
  );
});


//  REPAIR PAYMENT INDEXES

export const repairPaymentIndexes = asyncHandler(async (req, res) => {

  const indexes = [
    "transactionId_1",
    "razorpayOrderId_1",
    "razorpayPaymentId_1"
  ];

  for (const index of indexes) {

    try {
      await Payment.collection.dropIndex(index);
    } catch (error) {
      if (error.codeName !== "IndexNotFound") {
        throw error;
      }

    }

  }


  await Payment.syncIndexes();

  return res.status(200).json(
    new ApiResponse(200, "Payment indexes repaired successfully"
    )
  );
});


//  GET ALL PAYMENTS

export const getAllPayments = asyncHandler(async (req, res) => {

  const payments = await Payment.find()
    .populate("orderId")
    .populate("branchId", "branchName")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, "Payments fetched successfully", payments)
  );
});

//  GET PAYMENT BY ID

export const getPaymentById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid Payment ID")
    );
  }

  const payment = await Payment.findById(id)
    .populate("orderId")
    .populate("branchId", "branchName");

  if (!payment) {
    return res.status(404).json(
      new ApiResponse(404, "Payment not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Payment fetched successfully", payment)
  );

});

//  UPDATE PAYMENT

export const updatePayment = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid Payment ID")
    );
  }

  const payment = await Payment.findById(id);

  if (!payment) {
    return res.status(404).json(
      new ApiResponse(404, "Payment not found")
    );
  }

  Object.assign(payment, req.body);

  if (payment.status === "paid" && !payment.paidAt) {
    payment.paidAt = new Date();

    const order = await Order.findById(payment.orderId);

    if (order && order.status !== "completed") {
      await completePaidOrder(order);
    }
  }

  await payment.save();

  return res.status(200).json(
    new ApiResponse(200, "Payment updated successfully", payment)
  );

});

//  DELETE PAYMENT

export const deletePayment = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid Payment ID")
    );
  }

  const payment = await Payment.findById(id);

  if (!payment) {
    return res.status(404).json(
      new ApiResponse(404, "Payment not found")
    );
  }

  // Optional Safety Check
  if (payment.status === "paid") {
    return res.status(400).json(
      new ApiResponse(
        400,
        "Paid payment cannot be deleted"
      )
    );
  }

  await payment.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, "Payment deleted successfully"
    )
  );

});

//  GET PAYMENTS BY ORDER

export const getPaymentsByOrder = asyncHandler(async (req, res) => {

  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid Order ID")
    );
  }

  const payments = await Payment.find({ orderId })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, "Payments fetched successfully", payments
    )
  );

});

//  GET PAYMENTS BY BRANCH

export const getPaymentsByBranch = asyncHandler(async (req, res) => {

  const { branchId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid Branch ID")
    );
  }

  const payments = await Payment.find({ branchId })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Payments fetched successfully",
      payments
    )
  );

});
