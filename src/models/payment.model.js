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
    paymentGateway: {
      type: String,
      enum: ["razorpay"],
      default: null
    },

    transactionId: {
      type: String,
      trim: true
    },

    razorpayOrderId: {
      type: String,
      trim: true
    },

    razorpayPaymentId: {
      type: String,
      trim: true
    },

    razorpaySignature: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
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

paymentSchema.index(
  { transactionId: 1 },
  {
    unique: true,
    partialFilterExpression: { transactionId: { $exists: true, $ne: null } }
  }
);

paymentSchema.index(
  { razorpayOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayOrderId: { $exists: true, $ne: null } }
  }
);

paymentSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayPaymentId: {$exists: true, $ne: null  } }
  }
);

export default mongoose.model("Payment", paymentSchema);
