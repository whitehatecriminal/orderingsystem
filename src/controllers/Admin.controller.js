import jwt from "jsonwebtoken";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiRespose.js";

export const verifyAdminPassword = asyncHandler(async (req, res) => {
  const {password} = req.body;

  if (!password) {
    return res.status(400).json(
      new ApiResponse(400, null, "Password is required")
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json(
      new ApiResponse(401, null, "Invalid admin password")
    );
  }

  const adminToken = jwt.sign(
    {
      userId: req.user?.dbuser?._id,
      adminMode: true,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "5m",
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        adminToken,
      },
      "Admin access granted"
    )
  );
});