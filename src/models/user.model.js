// models/Student.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  role: { type: String, enum: ["student", "admin"], default: "student" },
  password: { type: String, required: true },

  totalMarks: { type: Number, required: true }, // Total SEE marks
  gpa: { type: Number, required: true }, // Overall GPA

  marks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mark" }], // linked marks

  preferences: {
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: "College" }],
  },

  refreshtoken: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  // short living token
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  // short living token
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export default mongoose.model("User", userSchema);
