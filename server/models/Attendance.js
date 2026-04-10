import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
},{timestamps:true});

export default mongoose.model("Attendance", attendanceSchema);