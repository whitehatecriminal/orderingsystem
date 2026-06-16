const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: [true, "Notification title is required"],
            trim: true,
            maxlength: 100
        },

        message: {
            type: String,
            required: [true, "Notification message is required"],
            trim: true,
            maxlength: 500
        },

        type: {
            type: String,
            enum: [
                "new_order",
                "order_preparing",
                "order_ready",
                "order_served",
                "payment",
                "reservation",
                "system_alert"
            ],
            default: "new_order"
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch"
        },

    isRead: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date,
            default: null
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Fast notification queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);