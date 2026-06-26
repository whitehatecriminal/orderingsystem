import { Router } from "express";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { isAdmin } from "../Middleware/admin.middleware.js"; 
import { attachBranch } from "../Middleware/attachBranch.middleware.js";
import {
  getOverview,
  getTrend,
  getInventory,
  getTopItems,
  getCategorySales,
  getStaffStats,
  getSummary
} from "../controllers/analytics.controller.js";

const router = Router();

router.use(verifyFirebaseToken, isAdmin, attachBranch);

router.get("/overview", getOverview);
router.get("/revenue-trend", getTrend);
router.get("/inventory-alerts", getInventory);
router.get("/top-items", getTopItems);
router.get("/sales-by-category", getCategorySales);
router.get("/staff-performance", getStaffStats);
router.get("/summary", getSummary);

export default router;