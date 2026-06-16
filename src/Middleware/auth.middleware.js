import { getAuth } from "firebase-admin/auth";
import "../../config/firebase.config.js"

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = await getAuth().verifyIdToken(token);
    console.log("decoded token", decodedToken)

    req.user = decodedToken;

    next();
  } catch (error) {
    console.log("error", error)
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};