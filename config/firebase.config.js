import { initializeApp, cert } from "firebase-admin/app";
import { readFileSync } from "fs";
import { join } from "path";

const serviceAccount = JSON.parse(
  readFileSync(
    join(
      process.cwd(),
      "orderingsystem-932e2-firebase-adminsdk-fbsvc-105d81aef9.json"
    ),
    "utf8"
  )
);

const app = initializeApp({
  credential: cert(serviceAccount),
});

export default app;