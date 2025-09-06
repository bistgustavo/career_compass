import express from "express";
import {
  createMark,
  getMarksByStudent,
  updateMark,
  deleteMark,
} from "../controllers/mark.controller.js";
import { verifyJwt } from "../middlewares/auth.js";

const router = express.Router();

// A mark always belongs to a logged-in student
router.post("/", verifyJwt, createMark);
router.get("/", verifyJwt, getMarksByStudent); // returns only this student's marks
router.put("/:id", verifyJwt, updateMark);
router.delete("/:id", verifyJwt, deleteMark);

export default router;
