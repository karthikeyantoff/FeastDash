import userModel from "../models/userModel.js";

// Add item to user cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.userId || (req.body && req.body.userId);
        const itemId = req.body.itemId || req.body.foodId;

        if (!itemId || typeof itemId !== "string") {
            return res.status(400).json({ success: false, message: "Valid itemId/foodId is required" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartData = { ...(userData.cartData || {}) };
        if (!cartData[itemId]) {
            cartData[itemId] = 1;
        } else {
            cartData[itemId] += 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.status(200).json({ success: true, message: "Item added to cart", cartData });
    } catch (error) {
        console.error("addToCart error:", error);
        return res.status(500).json({ success: false, message: "Server error updating cart" });
    }
};

// Remove item from user cart
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.userId || (req.body && req.body.userId);
        const itemId = req.body.itemId || req.body.foodId;

        if (!itemId || typeof itemId !== "string") {
            return res.status(400).json({ success: false, message: "Valid itemId/foodId is required" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartData = { ...(userData.cartData || {}) };
        if (cartData[itemId] > 1) {
            cartData[itemId] -= 1;
        } else {
            // Delete key completely when quantity drops to 0
            delete cartData[itemId];
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.status(200).json({ success: true, message: "Item removed from cart", cartData });
    } catch (error) {
        console.error("removeFromCart error:", error);
        return res.status(500).json({ success: false, message: "Server error updating cart" });
    }
};

// Fetch user cart data
export const getCart = async (req, res) => {
    try {
        const userId = req.userId || (req.body && req.body.userId);

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartData = userData.cartData || {};
        return res.status(200).json({ success: true, cartData });
    } catch (error) {
        console.error("getCart error:", error);
        return res.status(500).json({ success: false, message: "Server error fetching cart" });
    }
};
