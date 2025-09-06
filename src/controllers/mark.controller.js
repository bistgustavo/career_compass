import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespnose.js";
import Mark from "../models/mark.model.js";
import User from "../models/user.model.js";

const createMark = asyncHandler(async (req, res) => {
  const { student, subject, grade, gradePoint } = req.body;

  if (!student || !subject || !grade || !gradePoint) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if student exists
  const existingStudent = await User.findById(student);
  if (!existingStudent) {
    throw new ApiError(404, "Student not found");
  }

  // Check if mark already exists for this student and subject
  const existingMark = await Mark.findOne({ student, subject });
  if (existingMark) {
    throw new ApiError(409, "Mark already exists for this student and subject");
  }

  const mark = await Mark.create({
    student,
    subject,
    grade,
    gradePoint,
  });

  // Add mark to student's marks array
  await User.findByIdAndUpdate(student, {
    $push: { marks: mark._id },
  });

  const createdMark = await Mark.findById(mark._id).populate("student", "name email");

  return res
    .status(201)
    .json(new ApiResponse(201, createdMark, "Mark created successfully"));
});

const getMarksByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    throw new ApiError(400, "Student ID is required");
  }

  const marks = await Mark.find({ student: studentId })
    .populate("student", "name email")
    .sort({ subject: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, marks, "Student marks fetched successfully"));
});

const getMyMarks = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const marks = await Mark.find({ student: studentId })
    .populate("student", "name email")
    .sort({ subject: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, marks, "Your marks fetched successfully"));
});

const updateMark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, grade, gradePoint } = req.body;

  const mark = await Mark.findByIdAndUpdate(
    id,
    {
      subject,
      grade,
      gradePoint,
    },
    { new: true }
  ).populate("student", "name email");

  if (!mark) {
    throw new ApiError(404, "Mark not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, mark, "Mark updated successfully"));
});

const deleteMark = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mark = await Mark.findById(id);
  if (!mark) {
    throw new ApiError(404, "Mark not found");
  }

  // Remove mark from student's marks array
  await User.findByIdAndUpdate(mark.student, {
    $pull: { marks: id },
  });

  await Mark.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mark deleted successfully"));
});

const addMyMark = asyncHandler(async (req, res) => {
  const { subject, grade, gradePoint } = req.body;
  const studentId = req.user._id;

  if (!subject || !grade || !gradePoint) {
    throw new ApiError(400, "Subject, grade, and grade point are required");
  }

  // Check if mark already exists for this student and subject
  const existingMark = await Mark.findOne({ student: studentId, subject });
  if (existingMark) {
    throw new ApiError(409, "Mark already exists for this subject");
  }

  const mark = await Mark.create({
    student: studentId,
    subject,
    grade,
    gradePoint,
  });

  // Add mark to student's marks array
  await User.findByIdAndUpdate(studentId, {
    $push: { marks: mark._id },
  });

  const createdMark = await Mark.findById(mark._id).populate("student", "name email");

  return res
    .status(201)
    .json(new ApiResponse(201, createdMark, "Mark added successfully"));
});

const updateMyMark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, grade, gradePoint } = req.body;
  const studentId = req.user._id;

  const mark = await Mark.findOne({ _id: id, student: studentId });
  if (!mark) {
    throw new ApiError(404, "Mark not found or you don't have permission to update it");
  }

  const updatedMark = await Mark.findByIdAndUpdate(
    id,
    {
      subject,
      grade,
      gradePoint,
    },
    { new: true }
  ).populate("student", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedMark, "Mark updated successfully"));
});

const deleteMyMark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user._id;

  const mark = await Mark.findOne({ _id: id, student: studentId });
  if (!mark) {
    throw new ApiError(404, "Mark not found or you don't have permission to delete it");
  }

  // Remove mark from student's marks array
  await User.findByIdAndUpdate(studentId, {
    $pull: { marks: id },
  });

  await Mark.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mark deleted successfully"));
});

const getMarksBySubject = asyncHandler(async (req, res) => {
  const { subject } = req.params;

  if (!subject) {
    throw new ApiError(400, "Subject is required");
  }

  const marks = await Mark.find({ 
    subject: { $regex: subject, $options: "i" } 
  }).populate("student", "name email")
    .sort({ gradePoint: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, marks, `Marks for ${subject} fetched successfully`));
});

const calculateGPA = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const marks = await Mark.find({ student: studentId });

  if (marks.length === 0) {
    throw new ApiError(404, "No marks found for this student");
  }

  const totalGradePoints = marks.reduce((sum, mark) => sum + mark.gradePoint, 0);
  const gpa = totalGradePoints / marks.length;

  // Update student's GPA
  await User.findByIdAndUpdate(studentId, { gpa });

  return res
    .status(200)
    .json(new ApiResponse(200, { 
      gpa: parseFloat(gpa.toFixed(2)), 
      totalSubjects: marks.length,
      marks 
    }, "GPA calculated successfully"));
});

const getSubjectWiseAnalytics = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const marks = await Mark.find({ student: studentId });

  if (marks.length === 0) {
    throw new ApiError(404, "No marks found for this student");
  }

  const analytics = marks.map(mark => ({
    subject: mark.subject,
    grade: mark.grade,
    gradePoint: mark.gradePoint,
    percentage: (mark.gradePoint / 4.0) * 100,
    status: mark.gradePoint >= 2.0 ? "Pass" : "Fail"
  }));

  const overallGPA = marks.reduce((sum, mark) => sum + mark.gradePoint, 0) / marks.length;
  const overallPercentage = (overallGPA / 4.0) * 100;

  return res
    .status(200)
    .json(new ApiResponse(200, {
      subjectWise: analytics,
      overall: {
        gpa: parseFloat(overallGPA.toFixed(2)),
        percentage: parseFloat(overallPercentage.toFixed(2)),
        totalSubjects: marks.length,
        passedSubjects: marks.filter(mark => mark.gradePoint >= 2.0).length,
        failedSubjects: marks.filter(mark => mark.gradePoint < 2.0).length
      }
    }, "Analytics fetched successfully"));
});

export {
  createMark,
  getMarksByStudent,
  getMyMarks,
  updateMark,
  deleteMark,
  addMyMark,
  updateMyMark,
  deleteMyMark,
  getMarksBySubject,
  calculateGPA,
  getSubjectWiseAnalytics,
};
