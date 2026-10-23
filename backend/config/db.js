import mongoose from "mongoose";

export let lastDbError = null;

export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return true;
    }
    if (!process.env.MONGODB_URI) {
        lastDbError = "MONGODB_URI environment variable is missing or undefined";
        console.error(lastDbError);
        return false;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected successfully to ${conn.connection.host}`);
        lastDbError = null;
        return true;
    } catch (error) {
        lastDbError = error.message;
        console.error(`MongoDB Connection Error: ${error.message}`);
        return false;
    }
};
