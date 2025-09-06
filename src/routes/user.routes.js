import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserProfile,
  addUserMarks,
  getUserMarks,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(verifyJWT, updateUserProfile);
router.route("/add-marks").post(verifyJWT, addUserMarks);
router.route("/my-marks").get(verifyJWT, getUserMarks);

export default router;
