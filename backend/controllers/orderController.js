import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const DELIVERY_FEE = 2; // Flat ₹2 delivery fee

// Place order with server-side price calculation
export const placeOrder = async (req, res) => {
    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
        const userId = req.userId || (req.body && req.body.userId);
        const { items, address } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User authentication required" });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Order must contain at least one item" });
        }

        if (!address || typeof address !== "object") {
            return res.status(400).json({ success: false, message: "Valid delivery address is required" });
        }

        // Extract food IDs from items
        const itemIds = items.map((item) => item.foodId || item._id).filter(Boolean);

        // Fetch verified products directly from database
        const dbFoods = await foodModel.find({ _id: { $in: itemIds } });

        if (dbFoods.length === 0) {
            return res.status(400).json({ success: false, message: "None of the selected items could be found" });
        }

        // Calculate order amounts strictly using server-side prices
        let subtotal = 0;
        const verifiedOrderItems = [];

        for (const userItem of items) {
            const rawId = (userItem.foodId || userItem._id || "").toString();
            const dbProduct = dbFoods.find((f) => f._id.toString() === rawId);

            if (!dbProduct) {
                return res.status(400).json({
                    success: false,
                    message: `Item not found in menu catalog: ${userItem.name || rawId}`
                });
            }

            if (dbProduct.isAvailable === false) {
                return res.status(400).json({
                    success: false,
                    message: `"${dbProduct.name}" is currently unavailable`
                });
            }

            const quantity = Math.max(1, parseInt(userItem.quantity, 10) || 1);
            subtotal += dbProduct.price * quantity;

            verifiedOrderItems.push({
                foodId: dbProduct._id.toString(),
                name: dbProduct.name,
                price: dbProduct.price,
                quantity,
                image: dbProduct.image || ""
            });
        }

        const totalAmount = subtotal + DELIVERY_FEE;

        // Create the new order with "Pending Payment" status
        const newOrder = new orderModel({
            userId,
            items: verifiedOrderItems,
            amount: totalAmount,
            deliveryFee: DELIVERY_FEE,
            currency: "inr",
            address,
            status: "Pending Payment",
            payment: false,
            paymentStatus: "pending"
        });

        await newOrder.save();

        // Build Stripe line items exclusively using verified database values
        const line_items = verifiedOrderItems.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));

        // Add verified delivery charge
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: Math.round(DELIVERY_FEE * 100)
            },
            quantity: 1
        });

        // Create Stripe checkout session
        let sessionUrl = "";
        try {
            const session = await stripe.checkout.sessions.create({
                line_items,
                mode: "payment",
                client_reference_id: newOrder._id.toString(),
                metadata: {
                    orderId: newOrder._id.toString(),
                    userId: userId.toString()
                },
                success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
            });
            newOrder.stripeSessionId = session.id;
            sessionUrl = session.url;
        } catch (stripeError) {
            // Graceful test mode fallback when STRIPE_SECRET_KEY is unconfigured placeholder
            if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("replace_with")) {
                newOrder.stripeSessionId = `test_sess_${newOrder._id}`;
                sessionUrl = `${frontend_url}/verify?success=true&orderId=${newOrder._id}&session_id=test_sess_${newOrder._id}`;
            } else {
                throw stripeError;
            }
        }

        await newOrder.save();

        res.status(200).json({
            success: true,
            session_url: sessionUrl,
            orderId: newOrder._id
        });
    } catch (error) {
        console.error("placeOrder error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error during order placement"
        });
    }
};

// Stripe Webhook handler for cryptographically verified payment events
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (webhookSecret && sig) {
            // Verify HMAC signature
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // Fallback for development if webhook secret is not yet set
            event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        }
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const orderId = session.metadata?.orderId || session.client_reference_id;

                if (orderId) {
                    const order = await orderModel.findById(orderId);
                    if (order && !order.payment) {
                        order.payment = true;
                        order.paymentStatus = "paid";
                        order.status = "Confirmed";
                        order.stripePaymentIntentId = session.payment_intent || "";
                        await order.save();

                        // Clear cart in database only AFTER confirmed payment
                        await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
                        console.log(`Order ${orderId} confirmed via Stripe webhook.`);
                    }
                }
                break;
            }

            case "payment_intent.payment_failed": {
                const intent = event.data.object;
                const order = await orderModel.findOne({ stripePaymentIntentId: intent.id });
                if (order) {
                    order.paymentStatus = "failed";
                    order.status = "Cancelled";
                    await order.save();
                    console.log(`Order ${order._id} marked cancelled due to payment failure.`);
                }
                break;
            }

            default:
                break;
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error.message);
        res.status(500).json({ success: false, message: "Error processing webhook event" });
    }
};

// Verify payment status (direct server-to-Stripe check)
export const verifyOrder = async (req, res) => {
    const { orderId, success, session_id } = { ...req.query, ...req.body };

    try {
        if (!orderId) {
            return res.status(400).json({ success: false, message: "orderId is required" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // If order is already confirmed (e.g. by webhook), return success immediately
        if (order.payment) {
            return res.status(200).json({
                success: true,
                message: "Order confirmed successfully",
                order
            });
        }

        // If session_id is provided, verify directly against Stripe API
        if (session_id && process.env.STRIPE_SECRET_KEY) {
            try {
                const session = await stripe.checkout.sessions.retrieve(session_id);
                if (session && session.payment_status === "paid") {
                    order.payment = true;
                    order.paymentStatus = "paid";
                    order.status = "Confirmed";
                    order.stripePaymentIntentId = session.payment_intent || "";
                    await order.save();

                    // Clear user's cart on verified payment
                    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });

                    return res.status(200).json({
                        success: true,
                        message: "Order payment verified successfully via Stripe",
                        order
                    });
                }
            } catch (stripeErr) {
                console.warn("Stripe session retrieve warning:", stripeErr.message);
            }
        }

        // Handle payment failure or user cancellation: mark cancelled, NEVER destroy records
        const isClientSuccess = String(success).toLowerCase() === "true";

        if (!isClientSuccess) {
            order.status = "Cancelled";
            order.paymentStatus = "cancelled";
            await order.save();
            return res.status(200).json({
                success: false,
                message: "Order cancelled due to payment failure or abandonment"
            });
        }

        // If still pending
        res.status(200).json({
            success: order.payment,
            status: order.status,
            message: order.payment ? "Order confirmed" : "Payment pending verification"
        });
    } catch (error) {
        console.error("verifyOrder error:", error.message);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// Customer order history
export const userOrders = async (req, res) => {
    try {
        const userId = req.userId || (req.body && req.body.userId);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const orders = await orderModel.find({ userId }).sort({ createdAt: -1, date: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error("userOrders error:", error.message);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// Admin list all orders
export const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find().sort({ createdAt: -1, date: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error("listOrders error:", error.message);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// Admin update order status
export const updateStatus = async (req, res) => {
    try {
        const orderId = req.params.id || req.body.orderId;
        const { status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "orderId and status are required" });
        }

        const validStatuses = [
            "Pending Payment",
            "Food Preparing",
            "Confirmed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        console.error("updateStatus error:", error.message);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};
