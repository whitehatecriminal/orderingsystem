import mongoose from "mongoose";

const orderDetailsSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true
    },

    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true
        },

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        unitPrice: {
          type: Number,
          required: true,
          min: 0
        },

        totalPrice: {
          type: Number,
          required: true,
          min: 0
        },

        notes: {
          type: String,
          default: ""
        }
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model("OrderDetail", orderDetailsSchema);