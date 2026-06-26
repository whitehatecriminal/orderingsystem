import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },

    designation: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "manager",
        "waiter",
        "cashier",
        "chef",
        "kitchen_staff"   
      ]
    },

    salary: {
      type: Number,
      default: 0,
      min: 0
    },

    image: {
      type: String,
      default: ""
    },

    joiningDate: {
      type: Date,
      default: Date.now
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
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

employeeSchema.index({ employeeCode: 1 });
employeeSchema.index({ branchId: 1 });

export default mongoose.model(
  "Employee",
  employeeSchema
);