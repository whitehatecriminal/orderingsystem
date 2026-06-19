import express from "express";
import {
  createOrderDetail,
  getAllOrderDetails,
  getOrderDetailById,
  updateOrderDetail,
  deleteOrderDetail,
  getOrderDetailsByOrderId
} from "../controllers/orderDetails.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";

const router = express.Router();

// All order details routes require user authentication
router.use(verifyFirebaseToken);

router.post("/", createOrderDetail);
router.get("/", getAllOrderDetails);
router.get("/:id", getOrderDetailById);
router.get("/order/:orderId", getOrderDetailsByOrderId);
router.put("/:id", updateOrderDetail);
router.delete("/:id", deleteOrderDetail);

export default router;
