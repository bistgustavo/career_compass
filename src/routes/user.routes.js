import express from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  logoutUser,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.js";

const router = express.Router();

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", verifyJwt, logoutUser);

// Profile
router.get("/profile", verifyJwt, getProfile);

export default router;
