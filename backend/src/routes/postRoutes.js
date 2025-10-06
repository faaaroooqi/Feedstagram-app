import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; 

import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  likePost,
  getUserPosts
} from "../controllers/postController.js";

const router = express.Router();
router.post("/", authMiddleware, upload.array("images", 5), createPost);

router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.patch("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/like", authMiddleware, likePost);
router.get("/my-posts", authMiddleware, getUserPosts);


export default router;
