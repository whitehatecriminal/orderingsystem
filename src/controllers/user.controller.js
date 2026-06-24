import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  return res.status(200).json(
    new ApiResponse(200, "Users fetched successfully", users)
  );
});

// Get User By ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if it's MongoDB ID or Firebase UID
  let user;
  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findById(id).select("-password");
  } else {
    user = await User.findOne({ uid: id }).select("-password");
  }

  if (!user) {
    return res.status(404).json(
      new ApiResponse(404, "User not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "User fetched successfully", user)
  );
});

// Get Current Logged-in User profile
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user?.dbuser;

  if (!user) {
    return res.status(404).json(
      new ApiResponse(404, "Authenticated user not found in database")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Current user fetched successfully", user)
  );
});

// Update User Profile/Role
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Delete sensitive fields if not admin
  if (req.user?.dbuser?.role !== "admin") {
    delete updateData.role;
    delete updateData.email;
  }

  let user;
  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
  } else {
    user = await User.findOneAndUpdate(
      { uid: id },
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
  }

  if (!user) {
    return res.status(404).json(
      new ApiResponse(404, "User not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "User updated successfully", user)
  );
});

// Delete User
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let user;
  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findByIdAndDelete(id);
  } else {
    user = await User.findOneAndDelete({ uid: id });
  }

  if (!user) {
    return res.status(404).json(
      new ApiResponse(404, "User not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "User deleted successfully")
  );
});

