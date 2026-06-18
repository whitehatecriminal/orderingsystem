import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import ApiResponse from "../utils/ApiRespose.js"

export const registerUser = async (req, res) => {
   try {
    const firebaseUser = req.user;
    const data = req.body;

    // console.log("Firebase", firebaseUser)
    // console.log("dat", data)

    const existingUser = await User.findOne({
      email: firebaseUser.decodedToken.email
    });

    const password = data.userInfo.password;
    const passwordhash = await bcrypt.hash(password, 10)

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const user = await User.create({
      uid: firebaseUser.decodedToken.uid,
      fullName: firebaseUser.decodedToken.name || "User",
      email: firebaseUser.decodedToken.email,
      picture: firebaseUser.decodedToken.picture || "",
      phone: firebaseUser.decodedToken.phone_number || "",
      emailverified: firebaseUser.decodedToken.email_verified || false,
      signprovider: firebaseUser.decodedToken.firebase?.sign_in_provider || "firebase",
      role: data.userInfo.role,
      password: passwordhash,
      refreshToken: data.firebaseInfo.refreshtoken || ""
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const loginUser = async (req, res) => {
  const firebaseUser = req.user;
  const data  = req.body;
  
  const email = firebaseUser?.decodedToken?.email;

  if (!email) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Please provide email", null));
  }

  if (
    firebaseUser?.decodedToken?.firebase?.sign_in_provider === "password" &&
    !data.userInfo.password
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Please provide password", null));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, "User not found", null));
  }

  if (firebaseUser?.decodedToken?.firebase?.sign_in_provider === "password") {
    const isMatch = await bcrypt.compare(data.userInfo.password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Invalid password", null));
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Login successful", user));
};