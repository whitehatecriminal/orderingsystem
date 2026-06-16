import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    phone: String,

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "manager", "waiter", "cashier", "kitchen"],
      default: "waiter"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);