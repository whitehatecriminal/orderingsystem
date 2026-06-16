import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import ApiResponse from "../utils/ApiRespose.js"

export const registerUser = async (req, res) => {
   try {
    const firebaseUser = req.user;
    const data = req.body;
    console.log("Data", role)

    const existingUser = await User.findOne({
      email: firebaseUser.email
    });

    const password = data.userInfo.password;
    const passwordhash = bcrypt(password, 10)

    // const roles = User.find({
    //   role:  {$exists:  false}
    // });
    // console.log(roles)

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const user = await User.create({
      uid: firebaseUser.uid,
      fullName: firebaseUser.name || "User",
      email: firebaseUser.email,
      picture: firebaseUser.picture || "",
      phone: firebaseUser.phone_number || "",
      emailverified: firebaseUser.email_verified || false,
      signprovider: firebaseUser.firebase?.sign_in_provider || "firebase",
      role: userInfo.roles,
      password: passwordhash,
      refreshToken: userInfo.refreshToken || ""
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

export const loginUser = async (req, res)=> {
  const  firebaseUser = req.user;
  const {password} = req.body;

  //checking email exists or not
  const email = firebaseUser.email;

  if(!email){
    return new ApiResponse(400, "Please provide email", null)
  }

  const checkemail = await User.find({
    email: email,
    password
  });

  if(!checkemail) return new ApiResponse(401, "User not found", null)

  if(firebaseUser.firebase.sign_in_provider === "password"){
    //checking password
    if(!password) return res.status(400).json(new ApiResponse(400, "Please provide the password", null))
  }

  return res.status(200).json(
    new ApiResponse(200, "User data fetched", checkemail)
  );
}
