import express from "express"
import cors from "cors"
import helmet from "helmet";


const app = express();
const PORT = process.env.PORT;

// 1. Security & Utility Middlewares
app.use(helmet());
app.use(cors()); // Crucial for allowing requests from your headless storefront
app.use(express.json()); // Parses incoming JSON payloads

// 2. Health Check Route (Used by CI/CD pipelines to ensure the vault is online)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Code Vault Backend is operational',
  });
});

// 3. API Route Placeholders (To be built once your schema is finalized)


// TODO: Add Headless Storefront API routes here
// TODO: Add Payment webhook routes (Stripe, PayU, Komoju)
// TODO: Add Shipping integrations (Shiprocket, Shipmozo)

// 4. Global Error Handler (Catches any unhandled bugs)


app.listen(PORT, ()=>{
  console.log(`Server is listining on http://localhost:${PORT}`)
})

export default app