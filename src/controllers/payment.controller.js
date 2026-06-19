import Payment from "../models/payment.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create Payment
import Order from "../models/orders.model.js";
import Table from "../models/table.model.js";

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
    // Update order status
    order.status = "completed";
    await order.save();

    // Free the table
    await Table.findByIdAndUpdate(order.tableId, {
      status: "vacant",
      currentOrderId: null,
      occupiedSince: null
    });
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      "Payment registered successfully",
      payment
    )
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
