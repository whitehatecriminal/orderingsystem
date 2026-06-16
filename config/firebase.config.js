import admin from "firebase-admin";
import serviceAccount from "../orderingsystem-932e2-firebase-adminsdk-fbsvc-105d81aef9.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;