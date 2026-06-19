import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeesByBranch
} from "../controllers/employee.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { isAdmin } from "../Middleware/admin.middleware.js";

const router = express.Router();

// Get employee endpoints are accessible to authenticated users
router.get("/", verifyFirebaseToken, getAllEmployees);
router.get("/:id", verifyFirebaseToken, getEmployeeById);
router.get("/branch/:branchId", verifyFirebaseToken, getEmployeesByBranch);

// Management endpoints require admin role
router.post("/", verifyFirebaseToken, isAdmin, createEmployee);
router.put("/:id", verifyFirebaseToken, isAdmin, updateEmployee);
router.delete("/:id", verifyFirebaseToken, isAdmin, deleteEmployee);

export default router;
