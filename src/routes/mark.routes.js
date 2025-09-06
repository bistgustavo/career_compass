import { Router } from "express";
import {
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
} from "../controllers/mark.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Secured routes (require authentication)
router.route("/my-marks").get(verifyJWT, getMyMarks);
router.route("/add-my-mark").post(verifyJWT, addMyMark);
router.route("/update-my-mark/:id").put(verifyJWT, updateMyMark);
router.route("/delete-my-mark/:id").delete(verifyJWT, deleteMyMark);
router.route("/calculate-gpa").get(verifyJWT, calculateGPA);
router.route("/analytics").get(verifyJWT, getSubjectWiseAnalytics);

// Admin/Teacher routes (you can add admin middleware later)
router.route("/").post(createMark);
router.route("/student/:studentId").get(getMarksByStudent);
router.route("/subject/:subject").get(getMarksBySubject);
router.route("/:id").put(updateMark);
router.route("/:id").delete(deleteMark);

export default router;
