import express from "express";
import { addFood, updateFood, listFood, getFoodById, removeFood } from "../controllers/foodController.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.js";
import multer from "multer";

const foodRouter = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES) || 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            return cb(null, true);
        }
        return cb(new Error("Only image uploads are allowed"));
    }
});

/**
 * @openapi
 * /api/food/add:
 *   post:
 *     summary: Add a new food item (Admin)
 *     tags:
 *       - Food
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Food added successfully
 */
foodRouter.post("/add", adminAuthMiddleware, upload.single("image"), addFood);

/**
 * @openapi
 * /api/food/list:
 *   get:
 *     summary: Get list of food items
 *     tags:
 *       - Food
 *     responses:
 *       '200':
 *         description: A list of food items
 */
foodRouter.get("/list", listFood);

/**
 * @openapi
 * /api/food/{id}:
 *   get:
 *     summary: Get single food item
 *     tags:
 *       - Food
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Food item details
 */
foodRouter.get("/:id", getFoodById);

/**
 * @openapi
 * /api/food/{id}:
 *   put:
 *     summary: Update food item (Admin)
 *     tags:
 *       - Food
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Food updated successfully
 */
foodRouter.put("/:id", adminAuthMiddleware, upload.single("image"), updateFood);

/**
 * @openapi
 * /api/food/{id}:
 *   delete:
 *     summary: Remove a food item (Admin)
 *     tags:
 *       - Food
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Food removed
 */
foodRouter.delete("/:id", adminAuthMiddleware, removeFood);

// Backward-compatible POST endpoint for existing admin frontend
foodRouter.post("/remove", adminAuthMiddleware, removeFood);

export default foodRouter;
