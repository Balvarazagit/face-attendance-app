import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model(
  "User",
  new mongoose.Schema({}, { strict: false }),
  "users"
);

const Attendance = mongoose.model(
  "Attendance",
  new mongoose.Schema({}, { strict: false }),
  "attendances"
);

async function updateAttendanceUserIds() {
  try {
    const attendances = await Attendance.find();

    let updatedCount = 0;

    for (const attendance of attendances) {
      // skip if already has userId
      if (attendance.userId) continue;

      const user = await User.findOne({
        name: attendance.name,
      });

      if (user) {
        attendance.userId = user._id;
        await attendance.save();

        console.log(
          `✅ Updated: ${attendance.name} -> ${user._id}`
        );

        updatedCount++;
      } else {
        console.log(
          `❌ User not found for attendance: ${attendance.name}`
        );
      }
    }

    console.log(`\n🎉 Total Updated: ${updatedCount}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

updateAttendanceUserIds();