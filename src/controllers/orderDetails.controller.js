import OrderDetail from "../models/orderDetails.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create Order Detail
export const createOrderDetail = asyncHandler(async (req, res) => {
  const { orderId, menuItemId, quantity, unitPrice, notes } = req.body;

  const totalPrice = quantity * unitPrice;

  const orderDetail = await OrderDetail.create({
    orderId,
    menuItemId,
    quantity,
    unitPrice,
    totalPrice,
    notes
  });

  return res.status(201).json(
    new ApiResponse(201, "Order detail created successfully", orderDetail)
  );
});

// Get All Order Details
export const getAllOrderDetails = asyncHandler(async (req, res) => {
  const orderDetails = await OrderDetail.find()
    .populate("orderId")
    .populate("menuItemId");

  return res.status(200).json(
    new ApiResponse(200, "Order details fetched successfully", orderDetails)
  );
});

// Get Order Detail By ID
export const getOrderDetailById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid order detail ID")
    );
  }

  const orderDetail = await OrderDetail.findById(id)
    .populate("orderId")
    .populate("menuItemId");

  if (!orderDetail) {
    return res.status(404).json(
      new ApiResponse(404, "Order detail not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Order detail fetched successfully", orderDetail)
  );
});

// Update Order Detail
export const updateOrderDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid order detail ID")
    );
  }

  // Recalculate totalPrice if quantity or unitPrice is updated
  if (updateData.quantity !== undefined || updateData.unitPrice !== undefined) {
    const currentDetail = await OrderDetail.findById(id);
    if (currentDetail) {
      const quantity = updateData.quantity ?? currentDetail.quantity;
      const unitPrice = updateData.unitPrice ?? currentDetail.unitPrice;
      updateData.totalPrice = quantity * unitPrice;
    }
  }

  const orderDetail = await OrderDetail.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!orderDetail) {
    return res.status(404).json(
      new ApiResponse(404, "Order detail not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Order detail updated successfully", orderDetail)
  );
});

// Delete Order Detail
export const deleteOrderDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid order detail ID")
    );
  }

  const orderDetail = await OrderDetail.findByIdAndDelete(id);

  if (!orderDetail) {
    return res.status(404).json(
      new ApiResponse(404, "Order detail not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Order detail deleted successfully")
  );
});

// Get Order Details by Order ID
export const getOrderDetailsByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid order ID")
    );
  }

  const orderDetails = await OrderDetail.find({ orderId }).populate("menuItemId");

  return res.status(200).json(
    new ApiResponse(200, "Order details fetched successfully for the order", orderDetails)
  );
});
