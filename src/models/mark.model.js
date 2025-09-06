// models/Mark.js
import mongoose from "mongoose";

const markSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  subject: { type: String, required: true }, // Math, Science, English, etc.
  grade: { type: String, required: true },   // A, B+, C+, etc.
  gradePoint: { type: Number, required: true } // e.g., 3.6
});

export default mongoose.model("Mark", markSchema);
