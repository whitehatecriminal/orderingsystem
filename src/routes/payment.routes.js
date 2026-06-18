import express from "express";

import {
  createRazorpayOrder,
  getPaymentConfirmation,
  getPaymentHistory,
  getPaymentsByOrder,
  handleRazorpayWebhook,
  recordCashPayment,
  verifyRazorpayPayment
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/cash", recordCashPayment);
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);
router.post("/razorpay/webhook", handleRazorpayWebhook);
router.get("/history", getPaymentHistory);
router.get("/order/:orderId", getPaymentsByOrder);
router.get("/:id/confirmation", getPaymentConfirmation);

export default router;
