import User from "../models/User.js";
import Post from "../models/Post.js";
import bcrypt from "bcrypt";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found ❌" });

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { profilePic, bio, username, password } = req.body;

    // Ensure user is updating their own profile
    if (req.user.id !== id) {
      return res.status(403).json({ msg: "Not authorized ❌" });
    }

    const updateFields = {};

    if (profilePic) updateFields.profilePic = profilePic;
    if (bio) updateFields.bio = bio;
    if (username) updateFields.username = username;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(id, updateFields, { new: true });

    res.json({
      msg: "Profile updated ✅",
      user: {
        id: user._id,
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};