import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    action: {
      type: String,
      required: true,
      trim: true
    },

    module: {
      type: String,
      required: true,
      enum: [
        "user",
        "employee",
        "branch",
        "table",
        "category",
        "menu",
        "order",
        "payment",
        "inventory",
        "customer",
        "notification",
        "sales_report"
      ]
    },

    details: {
      type: String,
      default: "",
      maxlength: 1000
    },

    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    ipAddress: {
      type: String,
      default: ""
    },

    userAgent: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);