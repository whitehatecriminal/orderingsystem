import Employee from "../models/employee.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create Employee
export const createEmployee = asyncHandler(async (req, res) => {
  const { userId, designation, salary, joiningDate, branchId, isActive } = req.body;

  //check userid and branchid
  if(!userId || !branchId){
    return res.status(404).json(
      new ApiResponse(404, "cant find userid or branchID")
    )
  }

  if(!designation){
    return res.status(400).json(new ApiResponse(400, "PLease provide designation"))
  }

  //check if employee existed
  const existedEmployee = await Employee.findOne({
    userId,
    branchId
  });

  if (existedEmployee) {
    return res.status(400).json(
      new ApiResponse(400, "User is already an employee in this branch")
    );
  }

  // Find all employees globally to generate a unique employee code
  const employees = await Employee.find({}).select("employeeCode");

  let maxNumber = 0;
  employees.forEach(emp => {
    if (emp.employeeCode) {
      const num = parseInt(emp.employeeCode.replace("EMP", ""), 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  });

  const employeeCode = `EMP${String(maxNumber + 1).padStart(3, "0")}`;

  const employee = await Employee.create({
    userId,
    employeeCode,
    designation,
    salary,
    joiningDate,
    branchId,
    isActive
  });

  return res.status(201).json(
    new ApiResponse(201, "Employee registered successfully", employee)
  );
});

// Get All Employees
export const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find()
    .populate("userId", "fullName email role phone")
    .populate("branchId", "branchName location");

  return res.status(200).json(
    new ApiResponse(200, "Employees fetched successfully", employees)
  );
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return res.status(400).json(
      new ApiResponse(400, "Please provide Employee ID or Employee Code")
    );
  }

  let employee;

  // Search by MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(id)) {
    employee = await Employee.findById(id)
      .populate("userId", "fullName email role phone")
      .populate("branchId", "branchName location");
  }

  // If not found by _id, search by employeeCode
  if (!employee) {
    employee = await Employee.findOne({
      employeeCode: id.trim().toUpperCase(), // optional if codes are uppercase
    })
      .populate("userId", "fullName email role phone")
      .populate("branchId", "branchName location");
  }

  if (!employee) {
    return res.status(404).json(
      new ApiResponse(404, "Employee not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      "Employee fetched successfully",
      employee
    )
  );
});

// Update Employee
export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid employee ID")
    );
  }

  const employee = await Employee.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!employee) {
    return res.status(404).json(
      new ApiResponse(404, "Employee not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Employee updated successfully", employee)
  );
});

// Delete Employee
export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid employee ID")
    );
  }

  const employee = await Employee.findByIdAndDelete(id);

  if (!employee) {
    return res.status(404).json(
      new ApiResponse(404, "Employee not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Employee deleted successfully")
  );
});

// Get Employees by Branch
export const getEmployeesByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid branch ID")
    );
  }

  const employees = await Employee.find({ branchId })
    .populate("userId", "fullName email role phone");

  return res.status(200).json(
    new ApiResponse(200, "Employees fetched successfully for the branch", employees)
  );
});
