import Mark from "../models/mark.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespnose.js";

// ADD MARK
export const addMark = asyncHandler(async (req, res) => {
  const { studentId, subject, grade, gradePoint } = req.body;
  if (!studentId || !subject || !grade || gradePoint == null)
    throw new ApiError(400, "All fields are required");

  const student = await User.findById(studentId);
  if (!student) throw new ApiError(404, "Student not found");

  const mark = await Mark.create({ student: studentId, subject, grade, gradePoint });

  // attach mark to student.marks
  student.marks.push(mark._id);
  await student.save();

  return res.status(201).json(new ApiResponse(201, mark, "Mark added"));
});

// GET MARKS BY STUDENT
export const getMarksByStudent = asyncHandler(async (req, res) => {
  const marks = await Mark.find({ student: req.params.studentId });
  return res.status(200).json(new ApiResponse(200, marks, "Marks fetched"));
});

// DELETE MARK
export const deleteMark = asyncHandler(async (req, res) => {
  const mark = await Mark.findByIdAndDelete(req.params.id);
  if (!mark) throw new ApiError(404, "Mark not found");

  // also pull it from student.marks
  await User.findByIdAndUpdate(mark.student, { $pull: { marks: mark._id } });
  return res.status(200).json(new ApiResponse(200, null, "Mark deleted"));
});
