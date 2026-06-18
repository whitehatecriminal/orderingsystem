import express from "express"
import {createCategory, updateCategory, getAllCategories,
    getCategoryById, deleteCategory, toggleCategoryStatus
} from "../controllers/category.controller.js"
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import {isAdmin} from "../Middleware/admin.middleware.js"

const router  = express.Router();

router.post("/createcategory", verifyFirebaseToken, isAdmin, createCategory);

router.get("/allcategory", getAllCategories);

router.get("/:id", getCategoryById);

router.put("/:id", verifyFirebaseToken, isAdmin, updateCategory);

router.delete("/:id", verifyFirebaseToken, isAdmin, deleteCategory);

router.patch(
  "/:id/status",
  verifyFirebaseToken,
  isAdmin,
  toggleCategoryStatus
);

export default router