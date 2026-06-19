import Order from "../models/orders.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {

  const user = req.user
  console.log("User", user)
  const {
    tableNumver,
    customerId,
    branchId,
    specialInstructions,
    subtotal = 0,
    tax = 0,
    discount = 0
  } = req.body;

  const waiterId = user?.dbuser?._id;
  const table = await Table.findOne({
    tableNumber,
    branchId: branchId
  });

  if (!table) {
    return res.status(404).json(new ApiResponse(404, "Table not found"));
  }

  const totalAmount = subtotal + tax - discount;

  const order = await Order.create({
    tableId: table._id,
    customerId,
    waiterId,
    branchId,
    specialInstructions,
    subtotal,
    tax,
    discount,
    totalAmount
  });

  return res.status(201).json(
    new ApiResponse(201, "Order created successfully", order)
  );
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("tableId", "tableNumber")
    .populate("customerId")
    .populate("waiterId", "fullName email")
    .populate("branchId", "branchName");

  return res.status(200).json(
    new ApiResponse(200, "Orders fetched successfully", orders)
  );
});

import mongoose from "mongoose";

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid order ID")
    );
  }

  const order = await Order.findById(id)
    .populate("tableId", "tableNumber")
    .populate("customerId")
    .populate("waiterId", "fullName email")
    .populate("branchId", "branchName");

  if (!order) {
    return res.status(404).json(
      new ApiResponse(404, "Order not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Order fetched successfully", order)
  );
});

export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateData = { ...req.body };

  if (
    updateData.subtotal !== undefined ||
    updateData.tax !== undefined ||
    updateData.discount !== undefined
  ) {
    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json(
        new ApiResponse(404, "Order not found")
      );
    }

    const subtotal =
      updateData.subtotal ?? existingOrder.subtotal;

    const tax =
      updateData.tax ?? existingOrder.tax;

    const discount =
      updateData.discount ?? existingOrder.discount;

    updateData.totalAmount =
      subtotal + tax - discount;
  }

  const order = await Order.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!order) {
    return res.status(404).json(
      new ApiResponse(404, "Order not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Order updated successfully", order)
  );
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    return res.status(404).json(
      new ApiResponse(404, "Order not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Order deleted successfully")
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "preparing",
    "ready",
    "served",
    "completed",
    "cancelled"
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid order status")
    );
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!order) {
    return res.status(404).json(
      new ApiResponse(404, "Order not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Order status updated", order)
  );
});