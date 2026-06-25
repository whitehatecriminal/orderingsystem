import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiRespose.js";

export const verifyAdminAccess = (req, res, next) => {
  try {
    const token =
      req.header("X-Admin-Token") ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json(
        new ApiResponse(401, null, "Admin token required")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decoded.adminMode) {
      return res.status(403).json(
        new ApiResponse(403, null, "Admin access denied")
      );
    }

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json(
      new ApiResponse(401, null, "Invalid or expired admin token")
    );
  }
};