import mongoose from "mongoose";

const orderAddressSchema = new mongoose.Schema(
    {
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        email: { type: String, default: "" },
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        zipCode: { type: String, default: "" },
        country: { type: String, default: "" },
        phone: { type: String, default: "" }
    },
    { _id: false }
);

const orderItemSchema = new mongoose.Schema(
    {
        foodId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: "" }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: [v => Array.isArray(v) && v.length > 0, "Order must contain at least one item"]
        },
        amount: {
            type: Number,
            required: true
        },
        deliveryFee: {
            type: Number,
            default: 2
        },
        currency: {
            type: String,
            default: "inr"
        },
        address: {
            type: orderAddressSchema,
            required: true
        },
        status: {
            type: String,
            enum: [
                "Pending Payment",
                "Food Preparing",
                "Confirmed",
                "Preparing",
                "Out for Delivery",
                "Delivered",
                "Cancelled"
            ],
            default: "Pending Payment"
        },
        payment: {
            type: Boolean,
            default: false
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "cancelled"],
            default: "pending"
        },
        stripeSessionId: {
            type: String,
            default: "",
            index: true
        },
        stripePaymentIntentId: {
            type: String,
            default: ""
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const orderModel = mongoose.models.order || mongoose.model("orders", orderSchema);

export default orderModel;
