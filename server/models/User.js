import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  descriptor: {
    type: [Number], // face embedding array
    required: true,
  },
  avatar: {
    type: String, // base64 image
  },
},{timestamps:true});

export default mongoose.model("User", userSchema);