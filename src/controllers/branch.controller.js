import Branch from "../models/branch.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import Table from "../models/table.model.js"
import Payment from "../models/payment.model.js";
import Employee from "../models/employee.model.js"

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
    TableCapacity,
    staff,
    managerId,
    openingTime,
    closingTime
  } = req.body;

  if (!branchName || !address) {
    return res.status(400).json(
      new ApiResponse(400, "Please provide branch name and address")
    );
  }

  // Create Branch
  const branch = await Branch.create({
    branchName,
    address,
    city,
    state,
    pincode,
    phone,
    email,
    table: TableCapacity,
    staff,
    gstNumber,
    managerId,
    openingTime,
    closingTime
  });

  // Create Tables
  const tables = [];

  for (let i = 1; i <= TableCapacity; i++) {
    tables.push({
      branchId: branch._id,
      capacity: 4,          // default seating capacity
      tableNumber: i,
      status: "vacant"
    });
  }

  await Table.insertMany(tables);

  return res.status(201).json(
    new ApiResponse(
      201,
      "Branch and tables created successfully",
      {
        branch,
        totalTablesCreated: tables.length
      }
    )
  );
});

export const getAllBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find()
    .populate("managerId", "fullName email role");

  const branchData = await Promise.all(
    branches.map(async (branch) => {
      const [employeeCount, tableCount, revenueResult] = await Promise.all([
        Employee.countDocuments({ branchId: branch._id }),
        Table.countDocuments({ branchId: branch._id }),
        Payment.aggregate([
          {
            $match: {
              branchId: branch._id,
              status: "paid", // optional
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
            },
          },
        ]),
      ]);

      return {
        ...branch.toObject(),
        employeeCount,
        tableCount,
        totalRevenue:
          revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Branches fetched successfully",
      branchData
    )
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