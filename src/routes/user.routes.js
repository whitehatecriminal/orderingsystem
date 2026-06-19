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

const router = express.Router();

router.use(verifyFirebaseToken);

router.get("/me", getCurrentUser);
router.get("/", isAdmin, getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", isAdmin, deleteUser);

export default router;
