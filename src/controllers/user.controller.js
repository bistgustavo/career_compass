import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespnose.js";
import jwt from "jsonwebtoken";
import User  from "../models/user.model.js";

/* --------- Generate both tokens & persist refresh --------- */
const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/* --------- Register --------- */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, totalMarks, gpa } = req.body;

  if (!name || !email || !password || !totalMarks || !gpa){
    
    throw new ApiError(400, "All required fields must be provided");

  }
  
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Email already registered");

  const user = await User.create({
    name,
    email,
    password,
    phone,
    totalMarks,
    gpa,
  });

  const tokens = await generateAccessAndRefreshToken(user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, { user, ...tokens }, "Registered Successfully"));
});

/* --------- Login --------- */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email & Password required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const tokens = await generateAccessAndRefreshToken(user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user, ...tokens }, "Login Successful"));
});

/* --------- Refresh Token --------- */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (e) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== refreshToken)
    throw new ApiError(401, "Refresh token mismatch");

  const tokens = await generateAccessAndRefreshToken(user._id);

  return res.status(200).json(new ApiResponse(200, tokens, "Token Refreshed"));
});

/* --------- Logout (invalidate refresh) --------- */
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  return res.status(200).json(new ApiResponse(200, {}, "Logged out"));
});

/* --------- Get profile --------- */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "marks preferences.courses preferences.colleges"
  );
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "Profile fetched"));
});
