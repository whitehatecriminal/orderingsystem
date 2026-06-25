import AuditLog from "../models/audit.models.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create Audit Log
export const createAuditLog = asyncHandler(async (req, res) => {
  const { userId, action, module, details, recordId, ipAddress, userAgent } = req.body;

  const auditLog = await AuditLog.create({
    userId: userId || req.user?.dbuser?._id || null,
    action,
    module,
    details,
    recordId,
    ipAddress: ipAddress || req.ip || "",
    userAgent: userAgent || req.headers["user-agent"] || ""
  });

  return res.status(201).json(
    new ApiResponse(201, "Audit log created successfully", auditLog)
  );
});

// Get All Audit Logs
export const getAllAuditLogs = asyncHandler(async (req, res) => {
  const { module, userId, action } = req.query;
  const filter = {};

  if (module) filter.module = module;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) filter.userId = userId;
  if (action) filter.action = new RegExp(action, "i");

  const auditLogs = await AuditLog.find(filter)
    .populate("userId", "fullName email role")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, "Audit logs fetched successfully", auditLogs)
  );
});

// Get Audit Log By ID
export const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid audit log ID")
    );
  }

  const auditLog = await AuditLog.findById(id).populate("userId", "fullName email role");

  if (!auditLog) {
    return res.status(404).json(
      new ApiResponse(404, "Audit log not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Audit log fetched successfully", auditLog)
  );
});

// Delete Audit Log (Admin Cleanup)
export const deleteAuditLog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid audit log ID")
    );
  }

  const auditLog = await AuditLog.findByIdAndDelete(id);

  if (!auditLog) {
    return res.status(404).json(
      new ApiResponse(404, "Audit log not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Audit log deleted successfully")
  );
});
