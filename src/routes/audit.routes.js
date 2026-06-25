import express from "express";
import {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
  deleteAuditLog
} from "../controllers/audit.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { isAdmin } from "../Middleware/admin.middleware.js";

const router = express.Router();

// All audit log routes require authentication and admin privileges
router.use(verifyFirebaseToken);
router.use(isAdmin);

router.post("/", createAuditLog);
router.get("/", getAllAuditLogs);
router.get("/:id", getAuditLogById);
router.delete("/:id", deleteAuditLog);

export default router;
