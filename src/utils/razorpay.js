import crypto from "crypto";
import { ApiError } from "./ApiError.js";

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";

export const getRazorpayKeyId = () =>
  process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY;

const getRazorpayKeySecret = () =>
  process.env.RAZORPAY_KEY_SECRET ||
  process.env.RAZORPAY_SECRET_KEY ||
  process.env.RAZORPAY_SECRET;

const getRazorpayCredentials = () => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();

  if (!keyId || !keySecret) {
    throw new ApiError(
      500,
      "Razorpay credentials are missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
    );
  }

  return { keyId, keySecret };
};

export const createRazorpayOrder = async ({ amount, currency = "INR", receipt, notes }) => {
  const { keyId, keySecret } = getRazorpayCredentials();

  const amountInPaise = Math.round(Number(amount) * 100);

  if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
    throw new ApiError(400, "Payment amount must be at least INR 1");
  }

  const response = await fetch(`${RAZORPAY_API_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt,
      notes
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error?.description || "Unable to create Razorpay order",
      data
    );
  }

  return data;
};

export const verifyRazorpaySignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) => {
  const { keySecret } = getRazorpayCredentials();

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(razorpaySignature);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};
