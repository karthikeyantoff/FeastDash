import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        cartData: {
            type: Object,
            default: {}
        }
    },
    {
        minimize: false,
        timestamps: true
    }
);

const UserModel = mongoose.models.user || mongoose.model("User", userSchema);

export default UserModel;
