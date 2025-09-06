import { Router } from "express";
import {
  createCollege,
  getAllColleges,
  getCollegeById,
  searchCollegesByMarks,
  searchCollegesByLocation,
  getRecommendedColleges,
  updateCollege,
  deleteCollege,
} from "../controllers/college.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllColleges);
router.route("/:id").get(getCollegeById);
router.route("/search/location").get(searchCollegesByLocation);

// Secured routes (require authentication)
router.route("/search/by-marks").get(verifyJWT, searchCollegesByMarks);
router.route("/recommendations").get(verifyJWT, getRecommendedColleges);

// Admin routes (you can add admin middleware later)
router.route("/").post(createCollege);
router.route("/:id").put(updateCollege);
router.route("/:id").delete(deleteCollege);

export default router;
