import mongoose from "mongoose";

export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return true;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected successfully to ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        return false;
    }
};
