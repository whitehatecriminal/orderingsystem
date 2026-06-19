import { initializeApp, cert } from "firebase-admin/app";
import { readFileSync } from "fs";
import { join } from "path";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

const app = initializeApp({
  credential: cert(serviceAccount),
});

export default app;