// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Science, Management, Humanities, etc.
  description: String,
  durationYears: { type: Number, default: 2 }
});

export default mongoose.model("Course", courseSchema);
