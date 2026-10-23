import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { connectDB, lastDbError } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Dynamic CORS configuration allowing configured and development origins
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (such as mobile apps or curl)
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, true); // Fallback for local development
        },
        credentials: true
    })
);

// Skip JSON body parser for Stripe webhook to preserve raw binary stream
app.use((req, res, next) => {
    if (req.originalUrl === "/api/order/webhook") {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Swagger/OpenAPI Configuration with JWT Security Scheme
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "FeastDash API",
            version: "2.0.0",
            description: "Industry-Level Food Delivery Platform REST API"
        },
        servers: [
            { url: `http://localhost:${PORT}` }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./routes/*.js", "./backend/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static files for backward compatibility
app.use("/images", express.static("uploads"));

// Ensure database is connected for serverless invocations (e.g. Vercel)
app.use(async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        next();
    } catch (dbErr) {
        console.error("Serverless DB Connection Error:", dbErr);
        next();
    }
});

// Health Check Endpoint
app.get("/api/health", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "ok" : "degraded",
        service: "FeastDash API",
        timestamp: new Date().toISOString(),
        database: isDbConnected ? "connected" : (mongoose.connection.readyState === 2 ? "connecting" : "disconnected"),
        hasMongoUri: Boolean(process.env.MONGODB_URI),
        dbError: lastDbError,
        uptimeSeconds: Math.floor(process.uptime())
    });
});

// API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
    res.send("FeastDash API is running");
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// Start Server after connecting to MongoDB
export const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        console.log(`FeastDash server is running on port ${PORT}`);
        console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
        console.log(`Health check available at http://localhost:${PORT}/api/health`);
    });
    return server;
};

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
    startServer();
}

export default app;
