import OrderDetail from "../models/orderDetails.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/orders.model.js";
import mongoose from "mongoose";
import MenuItem from "../models/menu.model.js";
import Notification from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";

// Create Order Detail
export const createOrderDetail = asyncHandler(async (req, res) => {
  const { orderNumber, branchId, items = [], notes } = req.body;
  // const { orderNumber, branchId, quantity, menuItemId = [], unitPrice, notes } = req.body;
  //multiple order create on same orderid
  // after placing order update price of the order on that orderID and create a notifcation
  let menuItemIds = [];
  for (const item of items) {
    const { menuItemId, quantity, notes } = item;

    if (!menuItemId || !quantity) {
      return res
        .status(400)
        .json(new ApiError(400, "menuItemId and quantity are required"));
    }
    menuItemIds.push(item.menuItemId)
  }

  // checking orddderID exists or not in order table
  const existingOrder = await Order.findOne({
    orderNumber,
    branchId,
  });

  if (!existingOrder)
    return res
      .status(404)
      .json(new ApiError(404, "Order Number not found", null));

  // taking items
  const menuItem = await MenuItem.find({
    _id: { $in: menuItemIds },
  });

  if (!menuItem)
    return res.status(404).json(new ApiError(404, "Item not found"));
  if (menuItem.isAvailable === false)
    return res.status(503).json(new ApiError(503, "Item is not available"));

  let totalPrice = existingOrder.subtotal;
  let orderItems = [];

  for (let i = 0; i < menuItem.length; i++) {
    totalPrice += items[i].quantity * menuItem[i].price;
    orderItems.push({
      menuItemId: menuItem[i]._id,
      quantity: items[i].quantity,
      unitPrice: menuItem[i].price,
      totalPrice: menuItem[i].price * items[i].quantity,
      notes: items[i].notes
    })
  }

  // Create OrderDetail
  const orderDetail = await OrderDetail.create({
    orderId: existingOrder._id,
    items: orderItems,
  });

  // Update Order Amount
  const updatedOrder = await Order.findByIdAndUpdate(
    existingOrder._id,
    {
      $inc: {
        subtotal: totalPrice,
      },
      $set: {
        status: "pending",
      },
    },
    { new: true },
  );

  if (!updatedOrder) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while updating order amount"));
  }

  // Create Notification
  const notification = await Notification.create({
    userId: existingOrder.waiterId,
    title: "New Order",
    message: `Table ${existingOrder.orderNumber} placed a new order`,
    type: "new_order",
    relatedId: existingOrder._id,
    branchId,
    priority: "medium",
  });

  if (!notification) {
    return res
      .status(500)
      .json(new ApiError(500, "Unable to create notification"));
  }

  return res.status(201).json(
    new ApiResponse(201, "Order detail created successfully", {
      orderDetail,
      updatedOrder,
      notification
    }),
  );
});

// Get All Order Details
export const getAllOrderDetails = asyncHandler(async (req, res) => {
  const orderDetails = await OrderDetail.find()
    .populate("orderId")
    .populate("menuItemId");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Order details fetched successfully", orderDetails),
    );
});

// Get Order Detail By ID
export const getOrderDetailById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Invalid order detail ID"));
  }

  const orderDetail = await OrderDetail.findById(id)
    .populate("orderId")
    .populate("menuItemId");

  if (!orderDetail) {
    return res.status(404).json(new ApiResponse(404, "Order detail not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Order detail fetched successfully", orderDetail),
    );
});

// Update Order Detail
export const updateOrderDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Invalid order detail ID"));
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

  const orderDetail = await OrderDetail.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!orderDetail) {
    return res.status(404).json(new ApiResponse(404, "Order detail not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Order detail updated successfully", orderDetail),
    );
});

// Delete Order Detail
export const deleteOrderDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Invalid order detail ID"));
  }

  const orderDetail = await OrderDetail.findByIdAndDelete(id);

  if (!orderDetail) {
    return res.status(404).json(new ApiResponse(404, "Order detail not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Order detail deleted successfully"));
});

// Get Order Details by Order ID
export const getOrderDetailsByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json(new ApiResponse(400, "Invalid order ID"));
  }

  const orderDetails = await OrderDetail.find({ orderId }).populate(
    "menuItemId",
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Order details fetched successfully for the order",
        orderDetails,
      ),
    );
});
