import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentsByOrder,
  getPaymentsByBranch
} from "../controllers/payment.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { isAdmin } from "../Middleware/admin.middleware.js";

const router = express.Router();

router.use(verifyFirebaseToken);

router.post("/", createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.get("/order/:orderId", getPaymentsByOrder);
router.get("/branch/:branchId", getPaymentsByBranch);
router.put("/:id", isAdmin, updatePayment);
router.delete("/:id", isAdmin, deletePayment);

export default router;
