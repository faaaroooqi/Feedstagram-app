import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addComment,
  likeComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// Add a comment to a post
router.post("/posts/:id/comment", authMiddleware, addComment);

// Like/unlike a comment
router.post("/comments/:id/like", authMiddleware, likeComment);

// ✅ Update a comment
router.patch("/comments/:id", authMiddleware, updateComment);

// ✅ Delete a comment
router.delete("/comments/:id", authMiddleware, deleteComment);

export default router;
