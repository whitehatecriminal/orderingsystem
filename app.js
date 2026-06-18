import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./Db/index.js";
import authrouter from "./src/Routes/auth.routes.js";
import { apiLimiter } from "./src/Middleware/rateLimit.middleware.js";

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

import branch from "./src/Routes/branch.routes.js"
import category from "./src/Routes/category.routes.js"
import menu from "./src/Routes/menu.routes.js"
import table from "./src/Routes/table.routes.js"
import orders from "./src/Routes/order.routes.js"
app.use("/api/auth",authrouter)
app.use("/api/branch", branch)
app.use("/api/category", category)
app.use("/api/menu", menu)
app.use("/api/table", table)
app.use("/api/orders", orders)

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