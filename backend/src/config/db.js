import mongoose from "mongoose";

let isConnected = false; // cache the connection status

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using cached MongoDB connection");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI)

    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

export default connectDB;
