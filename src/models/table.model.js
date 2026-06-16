const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    status: {
      type: String,
      enum: [
        "vacant",
        "occupied",
        "reserved",
        "unavailable"
      ],
      default: "vacant"
    },

    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },

    mergedTables: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table"
      }
    ],

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
  {
    timestamps: true
  }
);

// Same table number can exist in different branches
tableSchema.index(
  {
    branchId: 1,
    tableNumber: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model("Table", tableSchema);