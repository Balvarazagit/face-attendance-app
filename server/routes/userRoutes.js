import express from "express";
import {
  registerUser,
  getUsers,
  deleteUser,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getUsers);

router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

export default router;