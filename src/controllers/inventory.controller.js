import Inventory from "../models/inventory.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create Inventory Item
export const createInventoryItem = asyncHandler(async (req, res) => {
  const { itemName, quantity, unit, minimumStock, supplier, costPerUnit, branchId, isActive } = req.body;

  const existingItem = await Inventory.findOne({ itemName });
  if (existingItem) {
    return res.status(400).json(
      new ApiResponse(400, "Inventory item with this name already exists")
    );
  }

  const inventoryItem = await Inventory.create({
    itemName,
    quantity,
    unit,
    minimumStock,
    supplier,
    costPerUnit,
    branchId,
    isActive,
    lastRestockedAt: quantity > 0 ? new Date() : null
  });

  return res.status(201).json(
    new ApiResponse(201, "Inventory item created successfully", inventoryItem)
  );
});

// Get All Inventory Items
export const getAllInventoryItems = asyncHandler(async (req, res) => {
  const inventoryItems = await Inventory.find().populate("branchId", "branchName location");

  return res.status(200).json(
    new ApiResponse(200, "Inventory items fetched successfully", inventoryItems)
  );
});

// Get Inventory Item By ID
export const getInventoryItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid inventory item ID")
    );
  }

  const inventoryItem = await Inventory.findById(id).populate("branchId", "branchName location");

  if (!inventoryItem) {
    return res.status(404).json(
      new ApiResponse(404, "Inventory item not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Inventory item fetched successfully", inventoryItem)
  );
});

// Update Inventory Item
export const updateInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid inventory item ID")
    );
  }

  // If quantity is updated to a higher amount, update lastRestockedAt
  if (updateData.quantity !== undefined) {
    const currentItem = await Inventory.findById(id);
    if (currentItem && updateData.quantity > currentItem.quantity) {
      updateData.lastRestockedAt = new Date();
    }
  }

  const inventoryItem = await Inventory.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!inventoryItem) {
    return res.status(404).json(
      new ApiResponse(404, "Inventory item not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Inventory item updated successfully", inventoryItem)
  );
});

// Delete Inventory Item
export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid inventory item ID")
    );
  }

  const inventoryItem = await Inventory.findByIdAndDelete(id);

  if (!inventoryItem) {
    return res.status(404).json(
      new ApiResponse(404, "Inventory item not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Inventory item deleted successfully")
  );
});

// Get Low Stock Items
export const getLowStockItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find();
  const lowStockItems = items.filter(item => item.isLowStock);

  return res.status(200).json(
    new ApiResponse(200, "Low stock inventory items fetched successfully", lowStockItems)
  );
});

// Get Inventory by Branch
export const getInventoryByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid branch ID")
    );
  }

  const inventoryItems = await Inventory.find({ branchId });

  return res.status(200).json(
    new ApiResponse(200, "Inventory fetched successfully for the branch", inventoryItems)
  );
});
