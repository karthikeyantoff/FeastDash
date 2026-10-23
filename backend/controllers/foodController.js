import foodModel from "../models/foodModel.js";
import cloudinary from "../config/cloudinary.js";

const UPLOAD_FOLDER = process.env.CLOUDINARY_FOLDER || "mern_stack_project_storage/FeastDash";

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: UPLOAD_FOLDER,
                resource_type: "image"
            },
            (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

// Add food item
const addFood = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        if (!name || !description || price === undefined || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, description, price, category) are required"
            });
        }

        const parsedPrice = Number(price);
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid positive number"
            });
        }

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: "Food image file is required"
            });
        }

        const uploadResult = await uploadToCloudinary(req.file.buffer);

        const food = new foodModel({
            name: name.trim(),
            description: description.trim(),
            price: parsedPrice,
            category: category.trim(),
            image: uploadResult.secure_url,
            cloudinaryPublicId: uploadResult.public_id,
            isAvailable: true
        });

        await food.save();
        res.status(201).json({
            success: true,
            message: "Food item added successfully",
            data: food
        });
    } catch (error) {
        console.error("addFood error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add food item"
        });
    }
};

// Update food item
const updateFood = async (req, res) => {
    try {
        const foodId = req.params.id || req.body.id;
        if (!foodId) {
            return res.status(400).json({ success: false, message: "Food ID is required" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        const { name, description, price, category, isAvailable } = req.body;

        if (name) food.name = name.trim();
        if (description) food.description = description.trim();
        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({ success: false, message: "Invalid price value" });
            }
            food.price = parsedPrice;
        }
        if (category) food.category = category.trim();
        if (isAvailable !== undefined) {
            food.isAvailable = String(isAvailable) === "true" || isAvailable === true;
        }

        // If a new image is uploaded, upload to Cloudinary and destroy old image
        if (req.file && req.file.buffer) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);

            // Clean up old image if public_id exists
            if (food.cloudinaryPublicId) {
                try {
                    await cloudinary.uploader.destroy(food.cloudinaryPublicId);
                } catch (cleanupErr) {
                    console.warn("Failed to delete old Cloudinary image:", cleanupErr.message);
                }
            }

            food.image = uploadResult.secure_url;
            food.cloudinaryPublicId = uploadResult.public_id;
        }

        await food.save();

        res.status(200).json({
            success: true,
            message: "Food item updated successfully",
            data: food
        });
    } catch (error) {
        console.error("updateFood error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update food item"
        });
    }
};

// List all food items
const listFood = async (req, res) => {
    try {
        const query = {};
        if (req.query.category && req.query.category !== "All") {
            query.category = req.query.category;
        }
        if (req.query.available !== undefined) {
            query.isAvailable = req.query.available === "true";
        }

        const foods = await foodModel.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: foods.length, data: foods });
    } catch (error) {
        console.error("listFood error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch food items" });
    }
};

// Get single food item
const getFoodById = async (req, res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }
        res.status(200).json({ success: true, data: food });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching food details" });
    }
};

// Remove food item
const removeFood = async (req, res) => {
    try {
        const foodId = req.params.id || req.body.id;
        if (!foodId) {
            return res.status(400).json({ success: false, message: "Food ID is required" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        // Delete from Cloudinary
        if (food.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(food.cloudinaryPublicId);
            } catch (err) {
                console.warn("Failed to delete Cloudinary image via public_id:", err.message);
            }
        } else if (food.image && food.image.includes("cloudinary.com")) {
            try {
                const parts = food.image.split("/");
                const filenameWithExt = parts.pop();
                const filename = filenameWithExt.split(".")[0];
                const folder = parts.pop();
                await cloudinary.uploader.destroy(`${folder}/${filename}`);
            } catch (err) {
                console.warn("Failed to delete image with fallback:", err.message);
            }
        }

        await foodModel.findByIdAndDelete(foodId);
        res.status(200).json({ success: true, message: "Food item removed successfully" });
    } catch (error) {
        console.error("removeFood error:", error);
        res.status(500).json({ success: false, message: "Failed to remove food item" });
    }
};

export { addFood, updateFood, listFood, getFoodById, removeFood };
