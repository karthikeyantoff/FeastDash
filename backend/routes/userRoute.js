import express from "express";
import { loginUser, registerUser, getUserProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/auth.js";

const userRouter = express.Router();

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User registered successfully
 */
userRouter.post("/register", registerUser);

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - User
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User logged in
 */
userRouter.post("/login", loginUser);

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile details
 */
userRouter.get("/profile", authMiddleware, getUserProfile);

export default userRouter;
