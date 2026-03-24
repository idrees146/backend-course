import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// Helper: generates both tokens and saves refreshToken to DB
const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

// Cookie options reused across login/logout/refresh
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
};

// ──────────────────────────────────────────────
// POST /api/v1/users/register
// ──────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
    // 1. Get user details from request body
    const { fullName, email, userName, password } = req.body;

    // 2. Validate — all fields are required
    if (
        [fullName, email, userName, password].some(
            (field) => !field?.trim()
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. Check if user already exists (by email or username)
    const existingUser = await User.findOne({
        $or: [{ userName: userName.toLowerCase() }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // 4. Get uploaded file paths from multer (both optional)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // 5. Upload files to cloudinary if provided
    const avatar = avatarLocalPath
        ? await uploadOnCloudinary(avatarLocalPath)
        : null;
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    // 6. Create user in DB
    const user = await User.create({
        fullName,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });

    // 8. Fetch created user without sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 9. Return success response
    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// ──────────────────────────────────────────────
// POST /api/v1/users/login
// ──────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body;

    if (!userName && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // isPasswordCorrect is a method on the document, not the Model
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken,
            }, "User logged in successfully")
        );
});

// ──────────────────────────────────────────────
// POST /api/v1/users/logout  (Protected)
// ──────────────────────────────────────────────
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out"));
});

// ──────────────────────────────────────────────
// POST /api/v1/users/refresh-token
// ──────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(200, {
                accessToken,
                refreshToken: newRefreshToken,
            }, "Access token refreshed")
        );
});

// ──────────────────────────────────────────────
// POST /api/v1/users/change-password  (Protected)
// ──────────────────────────────────────────────
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ──────────────────────────────────────────────
// GET /api/v1/users/current-user  (Protected)
// ──────────────────────────────────────────────
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// ──────────────────────────────────────────────
// PATCH /api/v1/users/update-account  (Protected)
// ──────────────────────────────────────────────
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
};
