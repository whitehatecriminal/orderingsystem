import { Router } from "express";
import { verifyFirebaseToken } from "../Middleware/auth.middleware.js";

const router = Router();

router.get("/profile", verifyFirebaseToken, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email
  });
});

export default router