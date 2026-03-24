import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ────────────────── Public Routes ──────────────────

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [userName, email, fullName, password]
 *             properties:
 *               userName:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: password123
 *               avatar:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               userName:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Username or email required
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.route("/login").post(loginUser);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh the access token
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.route("/refresh-token").post(refreshAccessToken);

// ────────────────── Protected Routes ──────────────────

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out
 *       401:
 *         description: Unauthorized
 */
router.route("/logout").post(verifyJWT, logoutUser);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change the current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password
 */
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

/**
 * @swagger
 * /users/current-user:
 *   get:
 *     summary: Get the currently logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/current-user").get(verifyJWT, getCurrentUser);

/**
 * @swagger
 * /users/update-account:
 *   patch:
 *     summary: Update account details (fullName, email)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email]
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account details updated
 *       400:
 *         description: All fields required
 */
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

export default router;
