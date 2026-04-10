import express from "express";
import {
  markAttendance,
  getAttendance,
  deleteAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/", markAttendance);
router.get("/", getAttendance);
router.delete("/:id", deleteAttendance);

export default router;