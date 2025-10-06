import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  images: [{ type: String }], // Cloudinary URLs
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
}, { timestamps: true });

export default mongoose.model("Post", postSchema);
