import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "INR"
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "debit_card", "credit_card", "upi", "wallet"],
      required: true
    },

    paymentGateway: {
      type: String,
      enum: ["cash", "razorpay"],
      required: true
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      trim: true
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      trim: true
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      trim: true
    },

    gatewayAmount: {
      type: Number,
      min: 0,
      default: 0
    },

    confirmationNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },

    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "success",
        "failed",
        "refunded"
      ],
      default: "pending"
    },

    failureReason: {
      type: String,
      trim: true,
      default: ""
    },

    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    notes: {
      type: String,
      trim: true,
      default: ""
    },

    paidAt: {
      type: Date,
      default: null
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

paymentSchema.index({ branchId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ paymentMethod: 1, status: 1 });

export default mongoose.model("Payment", paymentSchema);
