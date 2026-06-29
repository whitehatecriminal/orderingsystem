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
import {createBill, uploadImages} from "../controllers/billgenerator.controller.js"
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { authorizeRoles, isAdmin } from "../Middleware/admin.middleware.js";
import {upload} from "../Middleware/multer.middleware.js";

const router = express.Router();

// router.use(verifyFirebaseToken);
router.post("/bill", createBill)
router.post("/image", upload.single("Item"), uploadImages)

router.post("/", createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.get("/order/:orderId", getPaymentsByOrder);
router.get("/branch/:branchId", getPaymentsByBranch);
router.put("/:id", verifyFirebaseToken, authorizeRoles('admin', 'manager'), updatePayment);
router.delete("/:id", verifyFirebaseToken, isAdmin, deletePayment);

export default router;
