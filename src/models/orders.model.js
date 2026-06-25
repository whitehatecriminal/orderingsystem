import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      trim: true
    },

    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null
    },

    waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "ready",
        "served",
        "completed",
        "cancelled"
      ],
      default: "pending"
    },

    specialInstructions: {
      type: String,
      default: ""
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0
    },

    tax: {
      type: Number,
      default: 0,
      min: 0
    },


    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    guestCount: {
      type: Number,
      default: 1,
      min: 1
    },
  },
  {
    timestamps: true
  }
);

// Auto-generate order number
orderSchema.pre("save", async function () {
  if (!this.isNew) return;

  const lastOrder = await this.constructor
    .findOne()
    .sort({ createdAt: -1 });

  if (!lastOrder || !lastOrder.orderNumber) {
    this.orderNumber = "ORD-0001";
  } else {
    const lastNumber = parseInt(lastOrder.orderNumber.split("-")[1], 10);
    const nextNumber = lastNumber + 1;
    this.orderNumber = `ORD-${String(nextNumber).padStart(4, "0")}`;
  }
});

export default mongoose.model("Order", orderSchema);