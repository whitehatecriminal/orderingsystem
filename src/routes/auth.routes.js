import express from "express";

import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";
import { apiLimiter } from "../Middleware/rateLimit.middleware.js";
import {verifyAdminPassword} from "../controllers/Admin.controller.js"

const router = express.Router();

router.post("/register", apiLimiter, verifyFirebaseToken, registerUser);
router.post("/login", apiLimiter, verifyFirebaseToken, loginUser);
router.post("/admin", verifyAdminPassword)

export default router;