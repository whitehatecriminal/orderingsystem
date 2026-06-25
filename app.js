import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./Db/index.js";
import authrouter from "./src/routes/auth.routes.js";
import { apiLimiter } from "./src/Middleware/rateLimit.middleware.js";
import "./src/jobs/tableStatus.job.js";

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Utility Middlewares
app.use(helmet());
app.use(cors()); // Crucial for allowing requests from your headless storefront
app.use(express.json()); // Parses incoming JSON payloads

// Health Check Route
app.get("/api/health", apiLimiter, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Handheld Ordering System Backend is operational",
  });
});

import branch from "./src/routes/branch.routes.js"
import category from "./src/routes/category.routes.js"
import menu from "./src/routes/menu.routes.js"
import table from "./src/routes/table.routes.js"
import orders from "./src/routes/order.routes.js"
import Customers from "./src/routes/customer.routes.js"
import audit from "./src/routes/audit.routes.js"
import employee from "./src/routes/employee.routes.js"
import inventory from "./src/routes/inventory.routes.js"
import notification from "./src/routes/notification.routes.js"
import orderDetails from "./src/routes/orderDetails.routes.js"
import payment from "./src/routes/payment.routes.js"
import sales from "./src/routes/sales.routes.js"
import user from "./src/routes/user.routes.js"

app.use("/api/auth",authrouter)
app.use("/api/branch", branch)
app.use("/api/category", category)
app.use("/api/menu", menu)
app.use("/api/table", table)
app.use("/api/orders", orders)
app.use("/api/customers", Customers)
app.use("/api/audit", audit)
app.use("/api/employees", employee)
app.use("/api/inventory", inventory)
app.use("/api/notifications", notification)
app.use("/api/order-details", orderDetails)
app.use("/api/payments", payment)
app.use("/api/sales", sales)
app.use("/api/users", user)

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.statuscode || err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;