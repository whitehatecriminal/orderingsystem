import express from "express";
import { createOrder, getAllOrders, getOrderById, updateOrder,
    deleteOrder, updateOrderStatus
 } from "../controllers/order.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";

const router = express.Router()

router.post("/", createOrder);

router.get("/", getAllOrders);

router.get("/:id", getOrderById);

router.put("/:id", verifyFirebaseToken, updateOrder);

router.delete("/:id", verifyFirebaseToken, deleteOrder);

router.patch(
  "/:id/status",
  verifyFirebaseToken,
  updateOrderStatus
);

export default router