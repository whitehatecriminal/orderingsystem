import express from "express";
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationsByUser,
  markAsRead
} from "../controllers/notification.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { isAdmin } from "../Middleware/admin.middleware.js";

const router = express.Router();

// Apply auth middleware to all notification routes
router.use(verifyFirebaseToken);

// User-specific notification routes
router.get("/my", getNotificationsByUser);
router.patch("/:id/read", markAsRead);

// Generic notification routes
router.post("/", createNotification);
router.get("/", isAdmin, getAllNotifications);
router.get("/:id", getNotificationById);
router.put("/:id", updateNotification);
router.delete("/:id", isAdmin, deleteNotification);

export default router;
