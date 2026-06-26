import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import ApiResponse from "../utils/ApiRespose.js";
import Employee from "../models/employee.model.js";

export const registerUser = async (req, res) => {
  try {
    const firebaseUser = req.user;
    const data = req.body;

    const existingUser = await User.findOne({
      email: firebaseUser.decodedToken.email,
    });

    const password = data.userInfo.password;
    const passwordhash = await bcrypt.hash(password, 10);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      uid: firebaseUser.decodedToken.uid,
      fullName: firebaseUser.decodedToken.name || "User",
      email: firebaseUser.decodedToken.email,
      picture: firebaseUser.decodedToken.picture || "",
      phone: firebaseUser.decodedToken.phone_number || "",
      emailverified: firebaseUser.decodedToken.email_verified || false,
      signprovider:
        firebaseUser.decodedToken.firebase?.sign_in_provider || "firebase",
      role: data.userInfo.role || "waiter",
      password: passwordhash,
      refreshToken: data.firebaseInfo.refreshtoken || "",
    });

    // Find all employees globally to generate a unique employee code
    const employees = await Employee.find({}).select("employeeCode");

    let maxNumber = 0;

    employees.forEach((emp) => {
      if (emp.employeeCode) {
        const num = parseInt(emp.employeeCode.replace("EMP", ""), 10);

        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const employeeCode = `EMP${String(maxNumber + 1).padStart(3, "0")}`;

    const employee = await Employee.create({
      userId: user._id,
      employeeCode,
      designation: data.userInfo.role || "waiter",
      branchId: data.userInfo.branchId,
      isActive: data.userInfo.isActive ?? true,
    });

    const emp = {
      user,
      employee,
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      emp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  const firebaseUser = req.user;
  const data = req.body;

  const email = firebaseUser?.decodedToken?.email;

  if (!email) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Please provide email", null));
  }

  if (
    firebaseUser?.decodedToken?.firebase?.sign_in_provider === "password" &&
    !data.password
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Please provide password", null));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found", null));
  }

  if (firebaseUser?.decodedToken?.firebase?.sign_in_provider === "password") {
    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Invalid password", null));
    }
  }

  return res.status(200).json(new ApiResponse(200, "Login successful", user));
};
