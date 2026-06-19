import Notification from "../models/notification.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create Notification
export const createNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type, relatedId, branchId, priority } = req.body;

  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    relatedId,
    branchId,
    priority
  });

  return res.status(201).json(
    new ApiResponse(201, "Notification created successfully", notification)
  );
});

// Get All Notifications
export const getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate("userId", "fullName email")
    .populate("branchId", "branchName")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, "All notifications fetched successfully", notifications)
  );
});

// Get Notification By ID
export const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid notification ID")
    );
  }

  const notification = await Notification.findById(id)
    .populate("userId", "fullName email")
    .populate("branchId", "branchName");

  if (!notification) {
    return res.status(404).json(
      new ApiResponse(404, "Notification not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Notification fetched successfully", notification)
  );
});

// Update Notification
export const updateNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid notification ID")
    );
  }

  const notification = await Notification.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!notification) {
    return res.status(404).json(
      new ApiResponse(404, "Notification not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Notification updated successfully", notification)
  );
});

// Delete Notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid notification ID")
    );
  }

  const notification = await Notification.findByIdAndDelete(id);

  if (!notification) {
    return res.status(404).json(
      new ApiResponse(404, "Notification not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Notification deleted successfully")
  );
});

// Get Notifications for Logged-In User
export const getNotificationsByUser = asyncHandler(async (req, res) => {
  const userId = req.user?.dbuser?._id || req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid user ID")
    );
  }

  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, "User notifications fetched successfully", notifications)
  );
});

// Mark Notification as Read
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid notification ID")
    );
  }

  const notification = await Notification.findByIdAndUpdate(
    id,
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json(
      new ApiResponse(404, "Notification not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Notification marked as read successfully", notification)
  );
});
