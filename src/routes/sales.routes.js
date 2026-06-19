import express from "express";
import {
  createSalesReport,
  getAllSalesReports,
  getSalesReportById,
  updateSalesReport,
  deleteSalesReport,
  getSalesReportsByBranch,
  generateReport
} from "../controllers/sales.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { isAdmin } from "../Middleware/admin.middleware.js";

const router = express.Router();

// All sales routes require admin privileges
router.use(verifyFirebaseToken);
router.use(isAdmin);

router.post("/", createSalesReport);
router.post("/generate", generateReport);
router.get("/", getAllSalesReports);
router.get("/:id", getSalesReportById);
router.get("/branch/:branchId", getSalesReportsByBranch);
router.put("/:id", updateSalesReport);
router.delete("/:id", deleteSalesReport);

export default router;
