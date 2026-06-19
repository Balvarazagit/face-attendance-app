import Attendance from "../models/Attendance.js";

// Mark Attendance
export const markAttendance = async (req, res) => {
  try {
    const { userId, name, date } = req.body;

    const attendanceDate = date
      ? new Date(date)
      : new Date();

    attendanceDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const alreadyMarked = await Attendance.findOne({
      userId,
      date: {
        $gte: attendanceDate,
        $lt: nextDay,
      },
    });

    if (alreadyMarked) {
      return res.status(400).json({
        alreadyMarked: true,
        message: "Attendance already marked for this date ⚠️",
      });
    }

    await Attendance.create({
      userId,
      name,
      date: attendanceDate,
    });

    res.json({
      message: "Attendance marked successfully ✅",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Attendance
export const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      const data = await Attendance.find().populate("userId");
      return res.json(data);
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const data = await Attendance.find({
      date: {
        $gte: start,
        $lte: end,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Attendance
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Attendance.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Attendance record not found ❌",
      });
    }

    res.json({
      message: "Attendance deleted successfully 🗑️",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//manual attendance
export const manualAttendance = async (req, res) => {
  try {
    const { userId, name, date } = req.body;

    const attendanceDate = date
      ? new Date(date)
      : new Date();

    attendanceDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const alreadyMarked = await Attendance.findOne({
      userId,
      date: {
        $gte: attendanceDate,
        $lt: nextDay,
      },
    });

    if (alreadyMarked) {
      return res.status(400).json({
        message: "Attendance already marked for this date",
      });
    }

    await Attendance.create({
      userId,
      name,
      date: attendanceDate,
    });

    res.json({
      message: `${name} attendance marked successfully`,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};