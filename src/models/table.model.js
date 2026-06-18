import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 50
    },

    status: {
      type: String,
      enum: ["vacant", "occupied", "reserved", "unavailable"],
      default: "vacant"
    },

    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },

    occupiedSince: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

tableSchema.index(
  {
    branchId: 1,
    tableNumber: 1
  },
  {
    unique: true
  }
);

tableSchema.pre("save", async function(next) {
  if (!this.isNew) return;

  const lastTable = await this.constructor
    .findOne({ branchId: this.branchId })
    .sort({ tableNumber: -1 });

  this.tableNumber = lastTable
    ? lastTable.tableNumber + 1
    : 1;
});

export default mongoose.model("Table", tableSchema);