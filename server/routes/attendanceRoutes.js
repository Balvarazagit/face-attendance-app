import express from "express";
import {
  markAttendance,
  getAttendance,
  deleteAttendance,
  manualAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/", markAttendance);
router.get("/", getAttendance);
router.delete("/:id", deleteAttendance);
router.post("/manual", manualAttendance);

export default router;