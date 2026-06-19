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

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "wallet"],
      required: true
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
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

    paidAt: {
      type: Date,
      default: Date.now
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

export default mongoose.model("Payment", paymentSchema);