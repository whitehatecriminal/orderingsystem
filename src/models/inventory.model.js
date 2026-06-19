import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
            maxlength: 100
        },

        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },

        unit: {
            type: String,
            required: true,
            enum: [
                "kg",
                "gram",
                "liter",
                "ml",
                "piece",
                "packet",
                "bottle",
                "box"
            ]
        },

        minimumStock: {
            type: Number,
            default: 10,
            min: 0
        },

        supplier: {
            type: String,
            trim: true,
            default: ""
        },

        costPerUnit: {
            type: Number,
            default: 0,
            min: 0
        },

        lastRestockedAt: {
            type: Date,
            default: null
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

// Prevent duplicate inventory items
inventorySchema.index(
    { itemName: 1 },
    { unique: true }
);

// Virtual field
inventorySchema.virtual("isLowStock").get(function () {
    return this.quantity <= this.minimumStock;
});

inventorySchema.set("toJSON", {
    virtuals: true
});

inventorySchema.set("toObject", {
    virtuals: true
});
export default mongoose.model("Inventory", inventorySchema);