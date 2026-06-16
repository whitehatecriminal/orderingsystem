const mongoose = require("mongoose");

const salesReportSchema = new mongoose.Schema(
{
    reportDate: {
        type: Date,
        required: true,
        index: true
    },

    reportType: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "daily"
    },

    totalOrders: {
        type: Number,
        default: 0,
        min: 0
    },

    totalRevenue: {
        type: Number,
        default: 0,
        min: 0
    },

    totalTax: {
        type: Number,
        default: 0,
        min: 0
    },

    totalDiscount: {
        type: Number,
        default: 0,
        min: 0
    },

    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },

    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
{
    timestamps: true,
    versionKey: false
}
);

salesReportSchema.index({
    reportDate: -1
});

module.exports = mongoose.model(
    "SalesReport",
    salesReportSchema
);