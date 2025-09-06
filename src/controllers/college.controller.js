import College from "../models/college.model.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespnose.js";

// CREATE
export const createCollege = asyncHandler(async (req, res) => {
  const { name, location, phone, email, offeredCourses } = req.body;
  if (!name || !location) throw new ApiError(400, "Name and location required");

  const college = await College.create(
    { name, 
      location, 
      contact: {
        email,
        phone
      },
      offeredCourses
    }
  );
  return res.status(201).json(new ApiResponse(201, college, "College created"));
});

// READ ALL
export const getColleges = asyncHandler(async (req, res) => {
  const colleges = await College.find().populate("offeredCourses.course");
  return res.status(200).json(new ApiResponse(200, colleges, "Colleges fetched"));
});

// READ ONE
export const getCollege = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id).populate("offeredCourses.course");
  if (!college) throw new ApiError(404, "College not found");
  return res.status(200).json(new ApiResponse(200, college, "College fetched"));
});

// UPDATE
export const updateCollege = asyncHandler(async (req, res) => {
  const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!college) throw new ApiError(404, "College not found");
  return res.status(200).json(new ApiResponse(200, college, "College updated"));
});

// DELETE
export const deleteCollege = asyncHandler(async (req, res) => {
  await College.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, null, "College deleted"));
});
