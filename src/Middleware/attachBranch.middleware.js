import Employee from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import  asyncHandler  from "../utils/asyncHandler.js";

export const attachBranch = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findOne({ userId: req.user.dbuser._id }).lean();

  if (!employee) {
    throw new ApiError(404, "Employee record not found for this user");
  }

  req.branchId = employee.branchId;
  next();
});