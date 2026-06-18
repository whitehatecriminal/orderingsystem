import express from "express"
import {createTable, updateTable, getTablesByBranch, getAllTables,
    getTableById, deleteTable, updateTableStatus
} from "../controllers/table.controller.js"
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import {isAdmin} from "../Middleware/admin.middleware.js"

const router = express.Router();

router.post("/", verifyFirebaseToken, isAdmin, createTable);

router.get("/", getAllTables);

router.get("/:id", getTableById);

router.get("/branch/:branchId", getTablesByBranch);

router.put("/:id", verifyFirebaseToken, isAdmin, updateTable);

router.delete("/:id", verifyFirebaseToken, isAdmin, deleteTable);

router.patch(
  "/:id/status",
  verifyFirebaseToken,
  isAdmin,
  updateTableStatus
);

export default router