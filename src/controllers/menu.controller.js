import { uploadImage } from "../../config/cloudinary.config.js";
import MenuItem from "../models/menu.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createMenuItem = asyncHandler(async (req, res) => {
  const {
    name,
    categoryId,
    description,
    price,
    branchId,
    plate,
    customizationOptions
  } = req.body;

  if(!name || !categoryId || !price){
    return res.status(400).json(new ApiResponse(400, "PLease provide all field"))
  }

  let image = "";

  if (req.file) {
    const uploadedImage = await uploadImage(req.file.path);

    if (!uploadedImage) {
      return res.status(400).json(
        new ApiResponse(400, "Image upload failed")
      );
    }
    
    image = uploadedImage;
  }

  const menuItem = await MenuItem.create({
    name,
    categoryId,
    description,
    price,
    image,
    branchId,
    plate,
    customizationOptions
  });

  return res.status(201).json(
    new ApiResponse(201, "Menu item created successfully", menuItem)
  );
});

export const getAllMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find()
    .populate("categoryId", "name")
    .populate("branchId", "branchName");

  return res.status(200).json(
    new ApiResponse(200, "Menu items fetched successfully", menuItems)
  );
});

import mongoose from "mongoose";

export const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid menu item ID")
    );
  }

  const menuItem = await MenuItem.findById(id)
    .populate("categoryId", "name")
    .populate("branchId", "branchName");

  if (!menuItem) {
    return res.status(404).json(
      new ApiResponse(404, "Menu item not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Menu item fetched successfully", menuItem)
  );
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Create update object from req.body
  const updateData = { ...(req.body || {}) };

  // If image is uploaded, upload and add to update data
  if (req.file) {
    const localFilePath = req.file.path;
    const uploadedImag = await uploadImage(localFilePath);

    if (!uploadedImag) {
      return res.status(400).json(
        new ApiResponse(400, "Image upload failed")
      );
    }

    updateData.image = uploadedImag; // adjust according to your upload response
  }

  const menuItem = await MenuItem.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!menuItem) {
    return res.status(404).json(
      new ApiResponse(404, "Menu item not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Menu item updated successfully", menuItem)
  );
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findByIdAndDelete(id);

  if (!menuItem) {
    return res.status(404).json(
      new ApiResponse(404, "Menu item not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Menu item deleted successfully")
  );
});

export const toggleMenuItemAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id);

  if (!menuItem) {
    return res.status(404).json(
      new ApiResponse(404, "Menu item not found")
    );
  }

  menuItem.isAvailable = !menuItem.isAvailable;

  await menuItem.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      `Menu item ${menuItem.isAvailable ? "available" : "unavailable"}`,
      menuItem
    )
  );
});