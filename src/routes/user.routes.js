import express from "express";
import {
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  deleteUser
} from "../controllers/user.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { isAdmin } from "../Middleware/admin.middleware.js";
import {verifyAdminAccess} from "../Middleware/verifyadminaccess.middleware.js"

const router = express.Router();

router.use(verifyFirebaseToken);

router.get("/me", getCurrentUser);
router.get("/", verifyAdminAccess, getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", verifyAdminAccess, updateUser);
router.delete("/:id",verifyAdminAccess, deleteUser);

export default router;
