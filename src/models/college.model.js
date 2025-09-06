// models/College.js
import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  contact: {
    phone: String,
    email: String,
  },

  offeredCourses: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      minimumGPA: { type: Number, required: true },
      subjectRequirements: [
        {
          subject: { type: String, required: true },
          minGrade: { type: String, required: true },
          minGradePoint: { type: Number, required: true },
        },
      ],
    },
  ],
});

export default mongoose.model("College", collegeSchema);
