import Branch from "../models/branch.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createBranch = asyncHandler(async (req, res) => {
  const {
    branchName,
    address,
    city,
    state,
    pincode,
    phone,
    email,
    gstNumber,
    managerId,
    openingTime,
    closingTime
  } = req.body;

  const branch = await Branch.create({
    branchName,
    address,
    city,
    state,
    pincode,
    phone,
    email,
    gstNumber,
    managerId,
    openingTime,
    closingTime
  });

  return res.status(201).json(
    new ApiResponse(201, "Branch created successfully", branch)
  );
});

export const getAllBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find()
    .populate("managerId", "fullName email role");

  return res.status(200).json(
    new ApiResponse(200, "Branches fetched successfully", branches)
  );
});

export const getBranchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findById(id)
    .populate("managerId", "fullName email role");

  if (!branch) {
    return res.status(404).json(
      new ApiResponse(404, "Branch not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Branch fetched successfully", branch)
  );
});

export const updateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!branch) {
    return res.status(404).json(
      new ApiResponse(404, "Branch not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Branch updated successfully", branch)
  );
});

export const deleteBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findByIdAndDelete(id);

  if (!branch) {
    return res.status(404).json(
      new ApiResponse(404, "Branch not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Branch deleted successfully")
  );
});

export const toggleBranchStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findById(id);

  if (!branch) {
    return res.status(404).json(
      new ApiResponse(404, "Branch not found")
    );
  }

  branch.isActive = !branch.isActive;

  await branch.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      `Branch ${branch.isActive ? "activated" : "deactivated"}`,
      branch
    )
  );
});