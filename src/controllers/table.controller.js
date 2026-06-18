import Table from "../models/table.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createTable = asyncHandler(async (req, res) => {
  const { capacity, branchId } = req.body;

  const table = await Table.create({
    capacity,
    branchId
  });

  return res.status(201).json(
    new ApiResponse(201, "Table created successfully", table)
  );
});

export const getAllTables = asyncHandler(async (req, res) => {
  const tables = await Table.find()
    .populate("branchId", "branchName")
    .populate("currentOrderId");

  return res.status(200).json(
    new ApiResponse(200, "Tables fetched successfully", tables)
  );
});

import mongoose from "mongoose";

export const getTableById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid table ID")
    );
  }

  const table = await Table.findById(id)
    .populate("branchId", "branchName")
    .populate("currentOrderId");

  if (!table) {
    return res.status(404).json(
      new ApiResponse(404, "Table not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Table fetched successfully", table)
  );
});

export const updateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const table = await Table.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!table) {
    return res.status(404).json(
      new ApiResponse(404, "Table not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Table updated successfully", table)
  );
});

export const deleteTable = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const table = await Table.findByIdAndDelete(id);

  if (!table) {
    return res.status(404).json(
      new ApiResponse(404, "Table not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Table deleted successfully")
  );
});

export const updateTableStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "vacant",
    "occupied",
    "reserved",
    "unavailable"
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid status")
    );
  }

  const table = await Table.findById(id);

  if (!table) {
    return res.status(404).json(
      new ApiResponse(404, "Table not found")
    );
  }

  table.status = status;

  if (status === "occupied") {
    table.occupiedSince = new Date();
  }

  if (status === "vacant") {
    table.occupiedSince = null;
    table.currentOrderId = null;
  }

  await table.save();

  return res.status(200).json(
    new ApiResponse(200, "Table status updated", table)
  );
});

export const getTablesByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  const tables = await Table.find({
    branchId
  }).sort({ tableNumber: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Branch tables fetched successfully",
      tables
    )
  );
});