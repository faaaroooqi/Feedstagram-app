import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who gets notified
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who triggered it
    type: {
      type: String,
      enum: ["like_post", "comment_post", "like_comment"],
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
