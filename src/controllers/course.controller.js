import Course from "../models/Course.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// CREATE
export const createCourse = asyncHandler(async (req, res) => {
  const { name, description, durationYears } = req.body;
  if (!name) throw new ApiError(400, "Course name required");

  const course = await Course.create({ name, description, durationYears });
  return res.status(201).json(new ApiResponse(201, course, "Course created"));
});

// READ ALL
export const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find();
  return res.status(200).json(new ApiResponse(200, courses, "Courses fetched"));
});

// READ ONE
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");
  return res.status(200).json(new ApiResponse(200, course, "Course fetched"));
});

// UPDATE
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) throw new ApiError(404, "Course not found");
  return res.status(200).json(new ApiResponse(200, course, "Course updated"));
});

// DELETE
export const deleteCourse = asyncHandler(async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, null, "Course deleted"));
});
