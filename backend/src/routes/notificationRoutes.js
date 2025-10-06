// routes/notificationRoutes.js
import express from "express";
import Notification from "../models/Notification.js";
import  authMiddleware  from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get notifications
router.get("/", authMiddleware, async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate("sender", "username profilePic")
    .populate("post", "text")
    .populate("comment", "text")
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(notifications);
});

// ✅ Mark notifications as read
router.patch("/:id/read", authMiddleware, async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { read: true },
    { new: true }
  );
  res.json(notif);
});

export default router;
