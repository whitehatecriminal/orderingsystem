import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
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

export default mongoose.model("Category", categorySchema);