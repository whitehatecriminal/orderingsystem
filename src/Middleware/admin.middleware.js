import ApiResponse from "../utils/ApiRespose.js";

export const isAdmin = (req, res, next) => {
  const allowedRoles = ["admin", "manager"];

  if (!allowedRoles.includes(req.user?.dbuser?.role)) {
    return res
      .status(403)
      .json(new ApiResponse(403, "Access denied"));
  }

  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.dbuser?.role) {
      return res.status(401).json(
        new ApiResponse(401, "Unauthorized")
      );
    }

    if (!roles.includes(req.user.dbuser.role)) {
      return res.status(403).json(
        new ApiResponse(403, "Access Denied")
      );
    }

    next();
  };
};