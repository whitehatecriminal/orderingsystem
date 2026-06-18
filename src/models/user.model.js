import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true
    },

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

    picture: {
      type: String,
      required: false
    },

    phone: String,

    password: {
      type: String,
      required: false
    },

    role: {
      type: String,
      enum: ["admin", "manager", "waiter", "cashier", "kitchen"],
      default: "waiter"
    },

    emailverified: {
      type: Boolean,
      default: false
    },

    signprovider: {
      type: String,
      
    },
    refreshToken: {
      type: String,
      require: false
    }

  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);