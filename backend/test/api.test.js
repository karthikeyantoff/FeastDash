import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";
import app from "../server.js";
import { connectDB } from "../config/db.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

const TEST_PORT = 4055;
const BASE_URL = `http://localhost:${TEST_PORT}`;
let server;
let authToken = "";
let testUserId = "";
let testFoodId = "";

before(async () => {
    process.env.NODE_ENV = "test";
    await connectDB();
    await mongoose.connection.asPromise();
    server = app.listen(TEST_PORT);
});

after(async () => {
    // Clean up test data created during test run
    if (testUserId) {
        await userModel.findByIdAndDelete(testUserId);
        await orderModel.deleteMany({ userId: testUserId });
    }
    if (testFoodId) {
        await foodModel.findByIdAndDelete(testFoodId);
    }
    if (server) {
        server.close();
    }
    await mongoose.disconnect();
});

describe("FeastDash API Automated Verification Suite", () => {
    test("Health check endpoint returns status 200 and connected DB", async () => {
        const res = await fetch(`${BASE_URL}/api/health`);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.status, "ok");
        assert.equal(data.service, "FeastDash API");
        assert.equal(data.database, "connected");
    });

    test("User registration succeeds and returns valid JWT token", async () => {
        const uniqueEmail = `test_${Date.now()}@feastdash.test`;
        const res = await fetch(`${BASE_URL}/api/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Test Runner",
                email: uniqueEmail,
                password: "SecurePassword123!"
            })
        });

        assert.equal(res.status, 201);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.ok(data.token, "Expected token in registration response");
        assert.ok(data.user?.id, "Expected user id in registration response");

        authToken = data.token;
        testUserId = data.user.id;
    });

    test("User login succeeds with correct credentials", async () => {
        assert.ok(testUserId, "testUserId must be populated from registration");
        const user = await userModel.findById(testUserId);
        const res = await fetch(`${BASE_URL}/api/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: user.email,
                password: "SecurePassword123!"
            })
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.ok(data.token);
    });

    test("Authenticated user profile retrieval works via Bearer header", async () => {
        const res = await fetch(`${BASE_URL}/api/user/profile`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.equal(data.data.name, "Test Runner");
    });

    test("Unauthenticated menu addition is strictly rejected with HTTP 401", async () => {
        const res = await fetch(`${BASE_URL}/api/food/add`, {
            method: "POST"
        });
        assert.equal(res.status, 401);
    });

    test("Server-side price verification and order creation", async () => {
        // Create a test dish in DB directly to verify price calculation
        const testDish = new foodModel({
            name: "Verified Biryani",
            description: "Aromatic basmati rice with spices",
            price: 250,
            image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            category: "Rice",
            isAvailable: true
        });
        await testDish.save();
        testFoodId = testDish._id.toString();

        // Attempt order placement with client trying to forge a price of ₹1
        const res = await fetch(`${BASE_URL}/api/order/place`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({
                items: [
                    {
                        foodId: testFoodId,
                        name: "Spoofed Cheap Name",
                        price: 1, // Client attempting to tamper price!
                        quantity: 2
                    }
                ],
                address: {
                    firstName: "Test",
                    lastName: "Customer",
                    street: "123 Feast Street",
                    city: "Chennai",
                    state: "TN",
                    zipCode: "600001",
                    phone: "9876543210"
                }
            })
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.ok(data.orderId, "Expected orderId in response");

        // Fetch the created order from DB and verify the server calculated real price (250 * 2 + 2 = 502)
        const savedOrder = await orderModel.findById(data.orderId);
        assert.equal(savedOrder.amount, 502, "Server must enforce ₹502 (₹250*2 + ₹2 delivery), ignoring client price");
        assert.equal(savedOrder.items[0].name, "Verified Biryani", "Item name must come from trusted DB");
        assert.equal(savedOrder.status, "Pending Payment");
        assert.equal(savedOrder.payment, false);
    });

    test("Catalog listing returns dishes array", async () => {
        const res = await fetch(`${BASE_URL}/api/food/list`);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.ok(Array.isArray(data.data));
    });
});
