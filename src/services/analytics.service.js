import mongoose from "mongoose";
import Order from "../models/orders.model.js";
import MenuItem from "../models/menu.model.js";
import Inventory from "../models/inventory.model.js";

// ---------- helpers ----------

export const getDateRange = (period) => {
  const now = new Date();
  let start, end, prevStart, prevEnd;

  if (period === "week") {
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - diffToMonday);

    end = new Date(start);
    end.setDate(end.getDate() + 7);

    prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 7);
    prevEnd = new Date(start);
  } else if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevEnd = new Date(start);
  } else {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);

    prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 1);
    prevEnd = new Date(start);
  }

  return { start, end, prevStart, prevEnd };
};

export const pctChange = (curr, prev) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
};

// ---------- 1. Overview (Revenue / Orders / Guests / Avg Check) ----------

export const getOverviewStats = async (branchId, period) => {
  const { start, end, prevStart, prevEnd } = getDateRange(period);
  const bId = new mongoose.Types.ObjectId(branchId);
  const matchBase = { branchId: bId, status: { $ne: "cancelled" } };

  const buildGroup = (from, to) => [
    { $match: { ...matchBase, createdAt: { $gte: from, $lt: to } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalAmount" },
        ordersCount: { $sum: 1 },
        guestsCount: { $sum: "$guestCount" }
      }
    }
  ];

  const [[current], [previous]] = await Promise.all([
    Order.aggregate(buildGroup(start, end)),
    Order.aggregate(buildGroup(prevStart, prevEnd))
  ]);

  const currRevenue = current?.revenue || 0;
  const currOrders = current?.ordersCount || 0;
  const currGuests = current?.guestsCount || 0;
  const prevRevenue = previous?.revenue || 0;
  const prevOrders = previous?.ordersCount || 0;
  const prevGuests = previous?.guestsCount || 0;
  const avgCheck = currOrders > 0 ? currRevenue / currOrders : 0;

  return {
    revenue: currRevenue,
    revenueChangePct: pctChange(currRevenue, prevRevenue),
    ordersCount: currOrders,
    ordersChangePct: pctChange(currOrders, prevOrders),
    guestsCount: currGuests,
    guestsChangePct: pctChange(currGuests, prevGuests),
    avgCheck: Number(avgCheck.toFixed(2))
  };
};

// ---------- 2. Revenue Trend (Mon - Sun, current week) ----------

export const getRevenueTrend = async (branchId) => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;

  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - diffToMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const results = await Order.aggregate([
    {
      $match: {
        branchId: new mongoose.Types.ObjectId(branchId),
        status: { $ne: "cancelled" },
        createdAt: { $gte: weekStart, $lt: weekEnd }
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" }, // Mongo: 1=Sun..7=Sat
        revenue: { $sum: "$totalAmount" }
      }
    }
  ]);

  const dayMap = { 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat", 1: "Sun" };
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const revenueByDay = {};
  order.forEach((d) => (revenueByDay[d] = 0));
  results.forEach((r) => {
    revenueByDay[dayMap[r._id]] = r.revenue;
  });

  const trend = order.map((d) => ({ day: d, revenue: revenueByDay[d] }));
  const peak = Math.max(...trend.map((t) => t.revenue));

  return { trend, peak };
};

// ---------- 3. Inventory Alerts ----------

export const getInventoryAlerts = async (branchId) => {

  const items = await Inventory.find({
    branchId: new mongoose.Types.ObjectId(branchId),
    isActive: true,
    $expr: { $lte: ["$quantity", "$minimumStock"] }
  })
    .sort({ quantity: 1 })
    .lean();
    

  const alerts = items.map((item) => ({
    itemName: item.itemName,
    quantity: item.quantity,
    minimumStock: item.minimumStock,
    unit: item.unit,
    severity: item.quantity <= item.minimumStock * 0.5 ? "critical" : "warning"
  }));

  return {
    alerts,
    totalAlerts: alerts.length,
    criticalCount: alerts.filter((a) => a.severity === "critical").length
  };
};

// ---------- 4. Top Selling Items ----------

export const getTopSellingItems = async (branchId, period, limit = 10) => {
  const { start, end, prevStart, prevEnd } = getDateRange(period);
  const bId = new mongoose.Types.ObjectId(branchId);

  const buildPipeline = (from, to) => [
    { $match: { branchId: bId, status: { $ne: "cancelled" }, createdAt: { $gte: from, $lt: to } } },
    { $lookup: { from: "orderdetails", localField: "_id", foreignField: "orderId", as: "details" } },
    { $unwind: "$details" },
    {
      $group: {
        _id: "$details.menuItemId",
        revenue: { $sum: "$details.totalPrice" },
        ordersCount: { $sum: 1 }
      }
    }
  ];

  const [current, previous] = await Promise.all([
    Order.aggregate(buildPipeline(start, end)),
    Order.aggregate(buildPipeline(prevStart, prevEnd))
  ]);

  const prevMap = new Map(previous.map((p) => [p._id.toString(), p.revenue]));

  const topCurrent = current.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
  const topIds = topCurrent.map((c) => c._id);

  const menuItems = await MenuItem.find({ _id: { $in: topIds } })
    .populate("categoryId", "name")
    .lean();
  const menuMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

  return topCurrent.map((item) => {
    const menu = menuMap.get(item._id.toString());
    const prevRevenue = prevMap.get(item._id.toString()) || 0;
    return {
      menuItemId: item._id,
      name: menu?.name || "Unknown",
      category: menu?.categoryId?.name || "Uncategorized",
      revenue: item.revenue,
      ordersCount: item.ordersCount,
      changePct: pctChange(item.revenue, prevRevenue)
    };
  });
};

// ---------- 5. Sales by Category ----------

export const getSalesByCategory = async (branchId, period) => {
  const { start, end } = getDateRange(period);
  const bId = new mongoose.Types.ObjectId(branchId);

  const results = await Order.aggregate([
    { $match: { branchId: bId, status: { $ne: "cancelled" }, createdAt: { $gte: start, $lt: end } } },
    { $lookup: { from: "orderdetails", localField: "_id", foreignField: "orderId", as: "details" } },
    { $unwind: "$details" },
    {
      $lookup: {
        from: "menuitems",
        localField: "details.menuItemId",
        foreignField: "_id",
        as: "menuItem"
      }
    },
    { $unwind: "$menuItem" },
    {
      $group: {
        _id: "$menuItem.categoryId",
        revenue: { $sum: "$details.totalPrice" }
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category"
      }
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        category: { $ifNull: ["$category.name", "Uncategorized"] },
        revenue: 1
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  const totalRevenue = results.reduce((sum, r) => sum + r.revenue, 0);

  return results.map((r) => ({
    ...r,
    percentage: totalRevenue > 0 ? Number(((r.revenue / totalRevenue) * 100).toFixed(1)) : 0
  }));
};

// ---------- 6. Staff Performance ----------

export const getStaffPerformance = async (branchId, period) => {
  const { start, end } = getDateRange(period);
  const bId = new mongoose.Types.ObjectId(branchId);

  const results = await Order.aggregate([
    { $match: { branchId: bId, status: { $ne: "cancelled" }, createdAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: "$waiterId",
        revenue: { $sum: "$totalAmount" },
        ordersCount: { $sum: 1 }
      }
    },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "employees",
        localField: "_id",
        foreignField: "userId",
        as: "employee"
      }
    },
    { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        waiterId: "$_id",
        name: "$user.fullName",
        designation: { $ifNull: ["$employee.designation", "waiter"] },
        revenue: 1,
        ordersCount: 1
        
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  return results;
};