import express from "express"
import {createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch,
    toggleBranchStatus
} from "../controllers/branch.controller.js"
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import {isAdmin} from "../Middleware/admin.middleware.js"
import { verifyAdminAccess } from "../Middleware/verifyadminaccess.middleware.js";

const router = express.Router();

router.post(
  "/addbranch",
  verifyAdminAccess,
  createBranch
);

router.get("/allbranch", getAllBranches);

router.get("/onebranch/:id", getBranchById);

router.put(
  "/update/:id",
  verifyAdminAccess,
  updateBranch
);

router.delete(
  "/remove/:id",
  verifyAdminAccess,
  deleteBranch
);

router.patch(
  "/:id/status",
  verifyAdminAccess,
  toggleBranchStatus
);

export default router;