import Category from "../models/category.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, branchId } = req.body;

  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    return res.status(400).json(
      new ApiResponse(400, "Category already exists")
    );
  }

  const category = await Category.create({
    name,
    description,
    branchId
  });

  return res.status(201).json(
    new ApiResponse(201, "Category created successfully", category)
  );
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .populate("branchId", "branchName city");

  return res.status(200).json(
    new ApiResponse(200, "Categories fetched successfully", categories)
  );
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid category ID")
    );
  }

  const category = await Category.findById(id)
    .populate("branchId", "branchName city");

  if (!category) {
    return res.status(404).json(
      new ApiResponse(404, "Category not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Category fetched successfully", category)
  );
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!category) {
    return res.status(404).json(
      new ApiResponse(404, "Category not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Category updated successfully", category)
  );
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    return res.status(404).json(
      new ApiResponse(404, "Category not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Category deleted successfully")
  );
});

export const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json(
      new ApiResponse(404, "Category not found")
    );
  }

  category.isActive = !category.isActive;

  await category.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      `Category ${category.isActive ? "activated" : "deactivated"}`,
      category
    )
  );
});