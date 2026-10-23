import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.js";
import {
    placeOrder,
    verifyOrder,
    userOrders,
    listOrders,
    updateStatus,
    handleStripeWebhook
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Stripe Webhook (raw JSON body handled for signature verification)
orderRouter.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
);

/**
 * @openapi
 * /api/order/place:
 *   post:
 *     summary: Place a new order with server-verified prices
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - address
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               address:
 *                 type: object
 *     responses:
 *       '200':
 *         description: Order placed and checkout session URL returned
 */
orderRouter.post("/place", authMiddleware, placeOrder);

/**
 * @openapi
 * /api/order/verify:
 *   get:
 *     summary: Verify an order payment status
 *     tags:
 *       - Order
 *     parameters:
 *       - in: query
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Verification result
 */
orderRouter.get("/verify", verifyOrder);
orderRouter.post("/verify", verifyOrder);

/**
 * @openapi
 * /api/order/userorders:
 *   get:
 *     summary: Get order history for current customer
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of user orders
 */
orderRouter.get("/userorders", authMiddleware, userOrders);
orderRouter.post("/userorders", authMiddleware, userOrders); // backward compatibility

/**
 * @openapi
 * /api/order/list:
 *   get:
 *     summary: List all orders (Admin)
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Order list
 */
orderRouter.get("/list", adminAuthMiddleware, listOrders);

/**
 * @openapi
 * /api/order/status:
 *   post:
 *     summary: Update order status (Admin)
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - status
 *             properties:
 *               orderId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending Payment, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled]
 *     responses:
 *       '200':
 *         description: Status updated
 */
orderRouter.post("/status", adminAuthMiddleware, updateStatus);
orderRouter.patch("/status", adminAuthMiddleware, updateStatus);

export default orderRouter;
