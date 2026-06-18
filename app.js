// import express from "express"
// import cors from "cors"
// import helmet from "helmet";


// const app = express();
// const PORT = process.env.PORT || 5000;

// // 1. Security & Utility Middlewares
// app.use(helmet());
// app.use(cors()); // Crucial for allowing requests from your headless storefront
// app.use(express.json()); // Parses incoming JSON payloads

// // 2. Health Check Route (Used by CI/CD pipelines to ensure the vault is online)
// app.get('/api/health', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'Code Vault Backend is operational',
//   });
// });


// // 3. API Route Placeholders (To be built once your schema is finalized)

// // TODO: Add Headless Storefront API routes here
// // TODO: Add Payment webhook routes (Stripe, PayU, Komoju)
// // TODO: Add Shipping integrations (Shiprocket, Shipmozo)

// // 4. Global Error Handler (Catches any unhandled bugs)


// app.listen(PORT, ()=>{
//   console.log(`Server is listining on http://localhost:${PORT}`)
// })

// export default app


// himanshu

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import connectDB from "./Db/index.js";

import authRoutes from "./src/routes/auth.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import menuItemRoutes from "./src/routes/menuItem.routes.js";
import tableRouter from "./src/routes/table.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";



dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({
  verify: (req, res, buffer) => {
    if (req.originalUrl?.includes("/api/v1/payments/razorpay/webhook")) {
      req.rawBody = buffer;
    }
  }
}));


app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/menu-items", menuItemRoutes);
app.use("/api/v1/tables", tableRouter);
app.use("/api/v1/payments", paymentRoutes);



app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Handheld Ordering System Backend is operational",
  });
});

app.listen(PORT, () => {
  console.log(` Server is listening on http://localhost:${PORT}`);
});
