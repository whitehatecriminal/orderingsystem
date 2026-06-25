import express from "express"
import {createMenuItem, updateMenuItem, getAllMenuItems,
    getMenuItemById, deleteMenuItem, toggleMenuItemAvailability
} from "../controllers/menu.controller.js"
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import {isAdmin} from "../Middleware/admin.middleware.js"
import { verifyAdminAccess } from "../Middleware/verifyadminaccess.middleware.js";

const router  = express.Router();

// router.post("/", verifyFirebaseToken, isAdmin, createMenuItem);
router.post("/", createMenuItem);

router.get("/", getAllMenuItems);

router.get("/:id", getMenuItemById);

router.put("/:id", verifyFirebaseToken, isAdmin, updateMenuItem);

router.delete("/:id", verifyFirebaseToken, isAdmin, deleteMenuItem);

router.patch(
  "/:id/availability",
  verifyFirebaseToken,
  isAdmin,
  toggleMenuItemAvailability
);

export default router