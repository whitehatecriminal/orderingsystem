import express from "express"
import {createTable, updateTable, getTablesByBranch, getAllTables,
    getTableById, deleteTable, updateTableStatus
} from "../controllers/table.controller.js"
// import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { verifyAdminAccess } from "../Middleware/verifyadminaccess.middleware.js";

const router = express.Router();

router.post("/", verifyAdminAccess, createTable);

router.get("/", getAllTables);

router.get("/:id", getTableById);

router.get("/branch/:branchId", getTablesByBranch);

router.put("/:id", verifyAdminAccess, updateTable);

router.delete("/:id", verifyAdminAccess, deleteTable);

router.patch(
  "/:id/status",
  verifyAdminAccess,
  updateTableStatus
);

export default router