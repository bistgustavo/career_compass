import express from "express";
import {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
} from "../controllers/college.controller.js";
import { verifyJwt } from "../middlewares/auth.js";

const router = express.Router();

// CRUD
router.post("/", verifyJwt, createCollege);
router.get("/", getColleges);
router.get("/:id", getCollegeById);
router.put("/:id", verifyJwt, updateCollege);
router.delete("/:id", verifyJwt, deleteCollege);

export default router;
