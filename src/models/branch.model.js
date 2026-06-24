import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
      maxlength: 100
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: 300
    },

    city: {
      type: String,
      required: false,
      trim: true
    },

    state: {
      type: String,
      required: false,
      trim: true
    },

    table: {
      type: Number,
      required: true,
      default: 10
    },

    staff: {
      type: Number,
      required: true,
      default: 10
    },

    pincode: {
      type: String,
      required: false,
      match: [/^[0-9]{6}$/, "Invalid pincode"]
    },

    phone: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      match: [/^[0-9]{10}$/, "Invalid phone number"]
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email"
      ]
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    openingTime: {
      type: String,
      default: "09:00"
    },

    closingTime: {
      type: String,
      default: "23:00"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

branchSchema.index({ branchName: 1 });
branchSchema.index({ city: 1 });
branchSchema.index({ state: 1 });

export default mongoose.model("Branch", branchSchema);