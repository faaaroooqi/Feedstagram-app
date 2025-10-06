import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { username, password, bio, profilePic } = req.body;
    console.log("Signup request body:", req.body); 
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ msg: "Username already taken" });

    

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword, bio, profilePic });
    await user.save();

    res.json({ msg: "User registered successfully ✅" });
  } catch (error) {
    res.status(500).json({ msg: "Server error ❌", error });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", username, password);

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    console.log("Found user:", user.username);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match?", isMatch);

    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ msg: "Login successful ✅", token, user: { id: user._id, username: user.username, profilePic: user.profilePic, bio: user.bio  } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};



