import {
  getOverviewStats,
  getRevenueTrend,
  getInventoryAlerts,
  getTopSellingItems,
  getSalesByCategory,
  getStaffPerformance
} from "../services/analytics.service.js";

import ApiResponse from "../utils/ApiRespose.js";
import  asyncHandler  from "../utils/asyncHandler.js";

const VALID_PERIODS = ["today", "week", "month"];
const validatePeriod = (period) => (VALID_PERIODS.includes(period) ? period : "today");

const getOverview = asyncHandler(async (req, res) => {
  const data = await getOverviewStats(req.branchId, validatePeriod(req.query.period));
  return res.status(200).json(new ApiResponse(200, "Overview stats fetched successfully",data));
});

const getTrend = asyncHandler(async (req, res) => {
  const data = await getRevenueTrend(req.branchId);
  return res.status(200).json(new ApiResponse(200, "Revenue trend fetched successfully", data));
});

const getInventory = asyncHandler(async (req, res) => {
  const data = await getInventoryAlerts(req.branchId);
  return res.status(200).json(new ApiResponse(200, "Inventory alerts fetched successfully", data));
});

const getTopItems = asyncHandler(async (req, res) => {
  const data = await getTopSellingItems(req.branchId, validatePeriod(req.query.period));
  return res.status(200).json(new ApiResponse(200, "Top selling items fetched successfully", data));
});

const getCategorySales = asyncHandler(async (req, res) => {
  const data = await getSalesByCategory(req.branchId, validatePeriod(req.query.period));
  return res.status(200).json(new ApiResponse(200, "Sales by category fetched successfully", data));
});

const getStaffStats = asyncHandler(async (req, res) => {
  const data = await getStaffPerformance(req.branchId, validatePeriod(req.query.period));
  return res.status(200).json(new ApiResponse(200, "Staff performance fetched successfully", data));
});

const getSummary = asyncHandler(async (req, res) => {
  const period = validatePeriod(req.query.period);

  const [overview, trend, inventory, topItems, categorySales, staff] = await Promise.all([
    getOverviewStats(req.branchId, period),
    getRevenueTrend(req.branchId),
    getInventoryAlerts(req.branchId),
    getTopSellingItems(req.branchId, period),
    getSalesByCategory(req.branchId, period),
    getStaffPerformance(req.branchId, period)
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Dashboard summary fetched successfully",
        { overview, trend, inventory, topItems, categorySales, staff },
        
      )
    );
});

export { getOverview, getTrend, getInventory, getTopItems, getCategorySales, getStaffStats, getSummary };