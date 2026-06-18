export const isAdmin = (req, res, next) => {
  if (req.user?.dbuser?.role !== "admin") {
    return res
      .status(403)
      .json(new ApiResponse(403, "Access denied"));
  }

  next();
};