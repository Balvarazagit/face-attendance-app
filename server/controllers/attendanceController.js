import Attendance from "../models/Attendance.js";

// Mark Attendance
export const markAttendance = async (req, res) => {
  try {
    const { name } = req.body;

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // ✅ Same day duplicate avoid
    const alreadyMarked = await Attendance.findOne({
      name,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (alreadyMarked) {
      return res.status(400).json({
        message: "Attendance already marked today ⚠️",
      });
    }

    const attendance = new Attendance({
      name,
      date: today, // ✅ ONLY DATE (no time)
    });

    await attendance.save();

    res.json({ message: "Attendance marked ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get Attendance
export const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      const data = await Attendance.find();
      return res.json(data);
    }

    const start = new Date(date + "T00:00:00");
    const end = new Date(date + "T23:59:59");

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