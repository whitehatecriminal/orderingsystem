import SalesReport from "../models/sales.model.js";
import Order from "../models/orders.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create Sales Report manually
export const createSalesReport = asyncHandler(async (req, res) => {
  const { reportDate, reportType, totalOrders, totalRevenue, totalTax, totalDiscount, branchId } = req.body;

  const salesReport = await SalesReport.create({
    reportDate,
    reportType,
    totalOrders,
    totalRevenue,
    totalTax,
    totalDiscount,
    branchId,
    generatedBy: req.user?.dbuser?._id
  });

  return res.status(201).json(
    new ApiResponse(201, "Sales report created successfully", salesReport)
  );
});

// Get All Sales Reports
export const getAllSalesReports = asyncHandler(async (req, res) => {
  const salesReports = await SalesReport.find()
    .populate("branchId", "branchName location")
    .populate("generatedBy", "fullName email")
    .sort({ reportDate: -1 });

  return res.status(200).json(
    new ApiResponse(200, "Sales reports fetched successfully", salesReports)
  );
});

// Get Sales Report By ID
export const getSalesReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid sales report ID")
    );
  }

  const salesReport = await SalesReport.findById(id)
    .populate("branchId", "branchName location")
    .populate("generatedBy", "fullName email");

  if (!salesReport) {
    return res.status(404).json(
      new ApiResponse(404, "Sales report not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Sales report fetched successfully", salesReport)
  );
});

// Update Sales Report
export const updateSalesReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid sales report ID")
    );
  }

  const salesReport = await SalesReport.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!salesReport) {
    return res.status(404).json(
      new ApiResponse(404, "Sales report not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Sales report updated successfully", salesReport)
  );
});

// Delete Sales Report
export const deleteSalesReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid sales report ID")
    );
  }

  const salesReport = await SalesReport.findByIdAndDelete(id);

  if (!salesReport) {
    return res.status(404).json(
      new ApiResponse(404, "Sales report not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Sales report deleted successfully")
  );
});

// Get Sales Reports by Branch
export const getSalesReportsByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid branch ID")
    );
  }

  const salesReports = await SalesReport.find({ branchId }).sort({ reportDate: -1 });

  return res.status(200).json(
    new ApiResponse(200, "Sales reports fetched successfully for the branch", salesReports)
  );
});

// Generate Sales Report dynamically from Orders
export const generateReport = asyncHandler(async (req, res) => {
  const { branchId, startDate, endDate, reportType = "daily" } = req.body;

  if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid or missing branch ID")
    );
  }

  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  // Fetch completed orders for the branch within the time frame
  const orders = await Order.find({
    branchId,
    status: "completed",
    createdAt: { $gte: start, $lte: end }
  });

  let totalRevenue = 0;
  let totalTax = 0;
  let totalDiscount = 0;
  const totalOrders = orders.length;

  orders.forEach(order => {
    totalRevenue += order.totalAmount || 0;
    totalTax += order.tax || 0;
    totalDiscount += order.discount || 0;
  });

  const generatedReport = await SalesReport.create({
    reportDate: start,
    reportType,
    totalOrders,
    totalRevenue,
    totalTax,
    totalDiscount,
    branchId,
    generatedBy: req.user?.dbuser?._id
  });

  return res.status(201).json(
    new ApiResponse(201, "Sales report generated successfully", generatedReport)
  );
});
