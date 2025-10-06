import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  profilePic: { type: String } // Cloudinary URL
}, { timestamps: true });

export default mongoose.model("User", userSchema);
