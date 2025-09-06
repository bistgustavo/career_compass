import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addCourseToPreferences,
  removeCourseFromPreferences,
  getUserPreferredCourses,
} from "../controllers/course.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllCourses);
router.route("/:id").get(getCourseById);

// Secured routes (require authentication)
router.route("/preferences").get(verifyJWT, getUserPreferredCourses);
router.route("/preferences/add").post(verifyJWT, addCourseToPreferences);
router.route("/preferences/remove/:courseId").delete(verifyJWT, removeCourseFromPreferences);

// Admin routes (you can add admin middleware later)
router.route("/").post(createCourse);
router.route("/:id").put(updateCourse);
router.route("/:id").delete(deleteCourse);

export default router;
