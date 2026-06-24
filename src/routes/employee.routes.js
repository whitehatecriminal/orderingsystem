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
import { verifyAdminAccess } from "../Middleware/verifyadminaccess.middleware.js";

const router = express.Router();

// Get employee endpoints are accessible to authenticated users
router.get("/",  getAllEmployees);
router.get("/:id", getEmployeeById);
router.get("/branch/:branchId", verifyFirebaseToken, getEmployeesByBranch);

// Management endpoints require admin role
router.post("/", verifyAdminAccess, createEmployee);
router.put("/:id", verifyAdminAccess, updateEmployee);
router.delete("/:id", verifyAdminAccess, deleteEmployee);

export default router;
