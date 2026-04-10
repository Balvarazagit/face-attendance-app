import User from "../models/User.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("TYPE:", typeof req.body);
    const { name, descriptor,avatar  } = req.body;
    const existingUser = await User.findOne({ name });

    if (existingUser) {
      return res.status(400).json({ message: "User already registered ❌" });
    }
    if (!name || !descriptor) {
      return res.status(400).json({ message: "Missing data" });
    }

    const user = new User({ name, descriptor, avatar, });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("SAVE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};