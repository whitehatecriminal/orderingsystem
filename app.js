import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./Db/index.js";
import rateLimit from "express-rate-limit";

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//database connect
connectDB()
// Security & Utility Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Code Vault Backend is operational",
  });
});



// Home Route
import router from "./src/Routes/firebase.routes.js";

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Code Vault API",
  });
});
app.get('/firebase', (req, res) => {
  res.status(200).json({
    message: "firebase route working"
  })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

export default app;