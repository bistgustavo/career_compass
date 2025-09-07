import { Router } from "express";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getUserStats,
} from "../controllers/user.controller.js";
import {
  createCollege,
  updateCollege,
  deleteCollege,
} from "../controllers/college.controller.js";
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// Apply authentication and admin verification to all routes
router.use(verifyJWT);
router.use(verifyAdmin);

// User management routes
router.route("/users").get(getAllUsers);
router.route("/users/stats").get(getUserStats);
router.route("/users/:userId").delete(deleteUser);
router.route("/users/:userId/role").patch(updateUserRole);

// College management routes
router.route("/colleges").post(createCollege);
router.route("/colleges/:id").put(updateCollege);
router.route("/colleges/:id").delete(deleteCollege);

// Course management routes
router.route("/courses").post(createCourse);
router.route("/courses/:id").put(updateCourse);
router.route("/courses/:id").delete(deleteCourse);

export default router;
