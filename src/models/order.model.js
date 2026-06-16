const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
    orderNumber: {
        type: String,
        required: true,
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
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Order", orderSchema);