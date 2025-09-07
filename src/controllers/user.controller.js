import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespnose.js";
import User from "../models/user.model.js";
import Mark from "../models/mark.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshtoken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, totalMarks, gpa, role } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const userRole = role || 'student';
  
  // For students, totalMarks and GPA are required
  if (userRole === 'student' && (totalMarks === undefined || totalMarks === null || gpa === undefined || gpa === null)) {
    throw new ApiError(400, "Total marks and GPA are required for students");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const userData = {
    name,
    email,
    phone,
    password,
    role: userRole,
  };
  
  // Add totalMarks and gpa only for students
  if (userRole === 'student') {
    userData.totalMarks = totalMarks;
    userData.gpa = gpa;
  }
  
  const user = await User.create(userData);

  // Generate tokens for automatic login
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
      user: createdUser,
      accessToken,
      refreshToken,
    }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshtoken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshtoken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, totalMarks, gpa } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        name: name || req.user.name,
        phone: phone || req.user.phone,
        totalMarks: totalMarks || req.user.totalMarks,
        gpa: gpa || req.user.gpa,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const addUserMarks = asyncHandler(async (req, res) => {
  const { subject, grade, gradePoint } = req.body;

  if (!subject || !grade || !gradePoint) {
    throw new ApiError(400, "Subject, grade, and grade point are required");
  }

  const mark = await Mark.create({
    student: req.user._id,
    subject,
    grade,
    gradePoint,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $push: { marks: mark._id },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, mark, "Mark added successfully"));
});

const getUserMarks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("marks");

  return res
    .status(200)
    .json(new ApiResponse(200, user.marks, "User marks fetched successfully"));
});

// Admin-specific functions
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  
  const query = role ? { role } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const users = await User.find(query)
    .select('-password -refreshtoken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await User.countDocuments(query);
  
  const result = {
    docs: users,
    totalDocs: total,
    limit: parseInt(limit),
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
    hasPrevPage: parseInt(page) > 1,
  };
  
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Users fetched successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot delete your own account");
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  // Also delete related marks
  await Mark.deleteMany({ student: userId });
  
  await User.findByIdAndDelete(userId);
  
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  if (!role || !['student', 'admin'].includes(role)) {
    throw new ApiError(400, "Valid role is required");
  }
  
  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot change your own role");
  }
  
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select('-password -refreshtoken');
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User role updated successfully"));
});

const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  
  const stats = {
    totalUsers,
    totalStudents,
    totalAdmins,
  };
  
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "User statistics fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserProfile,
  addUserMarks,
  getUserMarks,
  // Admin functions
  getAllUsers,
  deleteUser,
  updateUserRole,
  getUserStats,
};
