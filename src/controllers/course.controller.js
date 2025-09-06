import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespnose.js";
import Course from "../models/course.model.js";
import User from "../models/user.model.js";

const createCourse = asyncHandler(async (req, res) => {
  const { name, description, durationYears } = req.body;

  if (!name) {
    throw new ApiError(400, "Course name is required");
  }

  const existingCourse = await Course.findOne({ name });
  if (existingCourse) {
    throw new ApiError(409, "Course with this name already exists");
  }

  const course = await Course.create({
    name,
    description,
    durationYears,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, course, "Course created successfully"));
});

const getAllCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const courses = await Course.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ name: 1 });

  const total = await Course.countDocuments();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
      "Courses fetched successfully"
    )
  );
});

const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course fetched successfully"));
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, durationYears } = req.body;

  const course = await Course.findByIdAndUpdate(
    id,
    {
      name,
      description,
      durationYears,
    },
    { new: true }
  );

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course updated successfully"));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Course deleted successfully"));
});

const addCourseToPreferences = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user._id;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if course is already in preferences
  if (user.preferences.courses.includes(courseId)) {
    throw new ApiError(400, "Course is already in preferences");
  }

  user.preferences.courses.push(courseId);
  await user.save();

  const updatedUser = await User.findById(userId)
    .select("-password -refreshtoken")
    .populate("preferences.courses");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser.preferences.courses,
        "Course added to preferences successfully"
      )
    );
});

const removeCourseFromPreferences = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.preferences.courses = user.preferences.courses.filter(
    (id) => id.toString() !== courseId
  );
  await user.save();

  const updatedUser = await User.findById(userId)
    .select("-password -refreshtoken")
    .populate("preferences.courses");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser.preferences.courses,
        "Course removed from preferences successfully"
      )
    );
});

const getUserPreferredCourses = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .select("preferences.courses")
    .populate("preferences.courses");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.preferences.courses,
        "Preferred courses fetched successfully"
      )
    );
});

export {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addCourseToPreferences,
  removeCourseFromPreferences,
  getUserPreferredCourses,
};
