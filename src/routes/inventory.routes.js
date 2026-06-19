import express from "express";
import {
  createInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  getInventoryByBranch
} from "../controllers/inventory.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { isAdmin } from "../Middleware/admin.middleware.js";
import {authorizeRoles} from "../Middleware/admin.middleware.js"

const router = express.Router();

// Read operations require user authentication
router.get("/", verifyFirebaseToken, getAllInventoryItems);
router.get("/low-stock", verifyFirebaseToken, getLowStockItems);
router.get("/:id", verifyFirebaseToken, getInventoryItemById);
router.get("/branch/:branchId", verifyFirebaseToken, getInventoryByBranch);

// Mutation operations require admin access
router.post("/", verifyFirebaseToken, authorizeRoles('admin', 'manager'), createInventoryItem);
router.put("/:id", verifyFirebaseToken, isAdmin, updateInventoryItem);
router.delete("/:id", verifyFirebaseToken, isAdmin, deleteInventoryItem);

export default router;
