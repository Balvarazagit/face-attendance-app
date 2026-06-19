import User from "../models/User.js";

// Register User
export const registerUser = async (req, res) => {
  try {

    const { name, descriptor,avatar  } = req.body;
    const existingUser = await User.findOne({ name });

    if (existingUser) {
      return res.status(400).json({ message: "User already registered ❌" });
    }
    if (
      !name ||
      !descriptor ||
      !Array.isArray(descriptor) ||
      descriptor.length !== 128
    ) {
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

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};