import express from "express";
import {
  createCourse,
  getCourses,
  // getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = express.Router();
// CRUD
router.post("/", verifyJwt, createCourse);
router.get("/", getCourses);
// router.get("/:id", getCourseById);
router.put("/:id", verifyJwt, updateCourse);
router.delete("/:id", verifyJwt, deleteCourse);

export default router;
