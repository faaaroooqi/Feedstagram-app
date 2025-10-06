import express from "express";
import { updateProfile, getUserProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

//router.get("/users/:id", getUserProfile);
router.patch("/users/:id", authMiddleware, updateProfile);
router.get("/users/:id", authMiddleware, getUserProfile);

export default router;
