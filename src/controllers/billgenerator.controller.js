import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Order from "../models/orders.model.js";
import OrderDetail from "../models/orderDetails.model.js";
import MenuItem from "../models/menu.model.js";
import Table from "../models/table.model.js";
import {uploadImage} from "../../config/cloudinary.config.js";
import fs from "fs";

export const createBill = asyncHandler(async (req, res) => {
  const { orderNumber, tableNumber, branchId } = req.body;
  let {discount} = req.body;

  if (!orderNumber && !tableNumber) {
    return res
      .status(400)
      .json(new ApiError(400, "Please provide Order Number or Table Number"));
  }

  if (!branchId) {
    return res.status(400).json(new ApiError(400, "Please provide Branch ID"));
  }

  let existingOrders = [];

  if (orderNumber) {
    existingOrders = await Order.find({
      branchId,
      orderNumber,
    }).populate("tableId");
  } else if (tableNumber) {
    const table = await Table.findOne({
      branchId,
      tableNumber: Number(tableNumber),
    });

    if (!table) {
      return res
        .status(404)
        .json(new ApiError(404, "Table not found in this branch"));
    }

    existingOrders = await Order.find({
      branchId,
      tableId: table._id,
      status: { $ne: "cancelled" },
    }).populate("tableId");
  }

  if (!existingOrders || existingOrders.length === 0) {
    return res
      .status(404)
      .json(new ApiError(404, "No active orders found to generate bill"));
  }

  const orderIds = existingOrders.map((order) => order._id);

  const orderDetails = await OrderDetail.find({
    orderId: { $in: orderIds },
  }).populate({
    path: "menuItemId",
    select: "name price",
  });

  // Calculate totals and format items list
  let subtotal = 0;
  let tax = 0;
  let totalAmount = 0;

  existingOrders.forEach((order) => {
    subtotal += order.subtotal || 0;
    tax += order.tax || 0;
    discount += order.discount || 0;
    totalAmount += order.totalAmount || 0;
  });
  totalAmount = totalAmount - discount;

  const items = orderDetails.map((detail) => ({
    name: detail.menuItemId?.name || "Unknown Item",
    quantity: detail.quantity,
    unitPrice: detail.unitPrice,
    totalPrice: detail.totalPrice,
    notes: detail.notes || "",
  }));

  const billDetails = {
    orders: existingOrders.map((order) => ({
      orderNumber: order.orderNumber,
      status: order.status,
      tableNumber: order.tableId?.tableNumber || null,
      createdAt: order.createdAt,
    })),
    items,
    subtotal,
    tax,
    discount,
    totalAmount,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "Bill generated successfully", billDetails));
});

// image uploader

export const uploadImages = asyncHandler(async(req, res)=> {
    
   if (!req.file) {
        throw new ApiError(400, "Image file is required");
    }

    const localFilePath = req.file.path;

    const result = await uploadImage(localFilePath);
    console.log(`result ${result}`)

    // Delete local file after upload
    fs.unlinkSync(localFilePath);

    return res.status(200).json(new ApiResponse(200,
      "Image Uploaded Successfully", result
    ))
})