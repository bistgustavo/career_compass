import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespnose.js";
import College from "../models/college.model.js";
import User from "../models/user.model.js";
import Mark from "../models/mark.model.js";

const createCollege = asyncHandler(async (req, res) => {
  const { name, location, contact, offeredCourses } = req.body;

  if (!name || !location) {
    throw new ApiError(400, "Name and location are required");
  }

  const college = await College.create({
    name,
    location,
    contact,
    offeredCourses,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, college, "College created successfully"));
});

const getAllColleges = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const colleges = await College.find()
    .populate("offeredCourses.course")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ name: 1 });

  const total = await College.countDocuments();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        colleges,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
      "Colleges fetched successfully"
    )
  );
});

const getCollegeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const college = await College.findById(id).populate("offeredCourses.course");

  if (!college) {
    throw new ApiError(404, "College not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, college, "College fetched successfully"));
});

const searchCollegesByMarks = asyncHandler(async (req, res) => {
  const { totalMarks, gpa, subjects } = req.query;
  const studentId = req.user._id;

  // If no search parameters provided, get student's own marks
  let searchTotalMarks = totalMarks;
  let searchGPA = gpa;
  let studentMarks = [];

  if (!totalMarks || !gpa) {
    const student = await User.findById(studentId).populate("marks");
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    
    searchTotalMarks = searchTotalMarks || student.totalMarks;
    searchGPA = searchGPA || student.gpa;
    studentMarks = student.marks;
  } else {
    // If subjects are provided, parse them
    if (subjects) {
      try {
        const parsedSubjects = JSON.parse(subjects);
        studentMarks = parsedSubjects.map(sub => ({
          subject: sub.subject,
          gradePoint: sub.gradePoint
        }));
      } catch (error) {
        throw new ApiError(400, "Invalid subjects format");
      }
    }
  }

  // Convert totalMarks to GPA equivalent if needed (assuming totalMarks out of 500)
  const calculatedGPA = searchGPA || (searchTotalMarks / 500) * 4.0;

  // Find colleges where the student meets the requirements
  const colleges = await College.find().populate("offeredCourses.course");

  const eligibleColleges = [];

  for (const college of colleges) {
    const eligibleCourses = [];

    for (const offeredCourse of college.offeredCourses) {
      let meetsRequirements = true;
      
      // Check minimum GPA requirement
      if (calculatedGPA < offeredCourse.minimumGPA) {
        meetsRequirements = false;
      }

      // Check subject-specific requirements
      if (meetsRequirements && offeredCourse.subjectRequirements.length > 0) {
        for (const requirement of offeredCourse.subjectRequirements) {
          const studentSubject = studentMarks.find(
            mark => mark.subject.toLowerCase() === requirement.subject.toLowerCase()
          );

          if (!studentSubject || studentSubject.gradePoint < requirement.minGradePoint) {
            meetsRequirements = false;
            break;
          }
        }
      }

      if (meetsRequirements) {
        eligibleCourses.push({
          ...offeredCourse.toObject(),
          matchPercentage: Math.min(100, (calculatedGPA / offeredCourse.minimumGPA) * 100)
        });
      }
    }

    if (eligibleCourses.length > 0) {
      const avgMatchPercentage = eligibleCourses.reduce((sum, course) => 
        sum + course.matchPercentage, 0) / eligibleCourses.length;

      eligibleColleges.push({
        ...college.toObject(),
        eligibleCourses,
        matchPercentage: Math.round(avgMatchPercentage)
      });
    }
  }

  // Sort by match percentage (highest first)
  eligibleColleges.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        colleges: eligibleColleges,
        searchCriteria: {
          totalMarks: searchTotalMarks,
          gpa: calculatedGPA,
          subjectsCount: studentMarks.length
        },
        totalEligible: eligibleColleges.length
      },
      "Eligible colleges found successfully"
    )
  );
});

const searchCollegesByLocation = asyncHandler(async (req, res) => {
  const { location } = req.query;

  if (!location) {
    throw new ApiError(400, "Location is required");
  }

  const colleges = await College.find({
    location: { $regex: location, $options: "i" }
  }).populate("offeredCourses.course");

  return res.status(200).json(
    new ApiResponse(
      200,
      colleges,
      `Colleges found in ${location}`
    )
  );
});

const getRecommendedColleges = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  const student = await User.findById(studentId)
    .populate("marks")
    .populate("preferences.courses")
    .populate("preferences.colleges");

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Get colleges based on preferred courses
  let query = {};
  if (student.preferences.courses.length > 0) {
    const preferredCourseIds = student.preferences.courses.map(course => course._id);
    query["offeredCourses.course"] = { $in: preferredCourseIds };
  }

  const colleges = await College.find(query).populate("offeredCourses.course");
  
  const recommendedColleges = [];

  for (const college of colleges) {
    const eligibleCourses = [];
    let hasPreferredCourse = false;

    for (const offeredCourse of college.offeredCourses) {
      let meetsRequirements = true;
      
      // Check if this is a preferred course
      const isPreferred = student.preferences.courses.some(
        prefCourse => prefCourse._id.toString() === offeredCourse.course._id.toString()
      );
      if (isPreferred) hasPreferredCourse = true;

      // Check minimum GPA requirement
      if (student.gpa < offeredCourse.minimumGPA) {
        meetsRequirements = false;
      }

      // Check subject-specific requirements
      if (meetsRequirements && offeredCourse.subjectRequirements.length > 0) {
        for (const requirement of offeredCourse.subjectRequirements) {
          const studentSubject = student.marks.find(
            mark => mark.subject.toLowerCase() === requirement.subject.toLowerCase()
          );

          if (!studentSubject || studentSubject.gradePoint < requirement.minGradePoint) {
            meetsRequirements = false;
            break;
          }
        }
      }

      if (meetsRequirements) {
        eligibleCourses.push({
          ...offeredCourse.toObject(),
          isPreferred,
          matchPercentage: Math.min(100, (student.gpa / offeredCourse.minimumGPA) * 100)
        });
      }
    }

    if (eligibleCourses.length > 0) {
      let recommendationScore = 0;
      
      // Base score from match percentage
      const avgMatchPercentage = eligibleCourses.reduce((sum, course) => 
        sum + course.matchPercentage, 0) / eligibleCourses.length;
      recommendationScore += avgMatchPercentage * 0.6;

      // Bonus for preferred courses
      if (hasPreferredCourse) {
        recommendationScore += 25;
      }

      // Bonus if college is in preferences
      const isPreferredCollege = student.preferences.colleges.some(
        prefCollege => prefCollege._id.toString() === college._id.toString()
      );
      if (isPreferredCollege) {
        recommendationScore += 15;
      }

      recommendedColleges.push({
        ...college.toObject(),
        eligibleCourses,
        recommendationScore: Math.round(Math.min(100, recommendationScore)),
        hasPreferredCourse,
        isPreferredCollege
      });
    }
  }

  // Sort by recommendation score (highest first)
  recommendedColleges.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        colleges: recommendedColleges.slice(0, 10), // Top 10 recommendations
        studentProfile: {
          gpa: student.gpa,
          totalMarks: student.totalMarks,
          preferredCourses: student.preferences.courses.length,
          preferredColleges: student.preferences.colleges.length
        }
      },
      "Recommended colleges fetched successfully"
    )
  );
});

const updateCollege = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, location, contact, offeredCourses } = req.body;

  const college = await College.findByIdAndUpdate(
    id,
    {
      name,
      location,
      contact,
      offeredCourses,
    },
    { new: true }
  ).populate("offeredCourses.course");

  if (!college) {
    throw new ApiError(404, "College not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, college, "College updated successfully"));
});

const deleteCollege = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const college = await College.findByIdAndDelete(id);

  if (!college) {
    throw new ApiError(404, "College not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "College deleted successfully"));
});

export {
  createCollege,
  getAllColleges,
  getCollegeById,
  searchCollegesByMarks,
  searchCollegesByLocation,
  getRecommendedColleges,
  updateCollege,
  deleteCollege,
};
