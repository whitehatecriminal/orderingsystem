import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true,
        minlength:2,
        maxlength:100
    },

    phone: {
      type: String,
      required: [false, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
    },
 

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address"
      ]
    },

    visitCount: {
        type: Number,
        default: 0,
        min: 0
    },

    totalOrders: {
        type: Number,
        default: 0,
        min: 0
    },

    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },

    notes: {
        type: String,
        default: "",
        maxlength: 500
    }
},
{
    timestamps: true
}
);

export default mongoose.model("Customer", customerSchema);