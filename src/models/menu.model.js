import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    plate: {
        type: String,
        enum: ["None", "Popular", "Vegetarian", "Chef Special", "Fresh New"],
        default: "None"
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    image: {
        type: String,
        default: ""
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },

    isAvailable: {
        type: Boolean,
        default: true
    },

    customizationOptions: [{
        type: String
    }]
},
{
    timestamps: true
}
);

export default mongoose.model("MenuItem", menuItemSchema);