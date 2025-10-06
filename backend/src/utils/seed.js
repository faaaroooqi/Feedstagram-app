import dotenv from "dotenv";
dotenv.config();
import { faker } from "@faker-js/faker";
import User from "../models/User.js";
import Post from "../models/Post.js";
import connectDB from "../config/db.js";

const seedData = async () => {
  try {
    await connectDB();


    // Create dummy users
    const users = [];
    for (let i = 0; i < 5; i++) {
      const user = new User({
        username: faker.internet.username(),   // ✅ updated
        password: "123456",                    // plain text (you can hash later)
        bio: faker.lorem.sentence(),
        profilePic: faker.image.avatar(),      // ✅ still valid
      });
      await user.save();
      users.push(user);
    }

    // Create dummy posts
    for (let i = 0; i < 10; i++) {
      const post = new Post({
        user: users[Math.floor(Math.random() * users.length)]._id,
        text: faker.lorem.paragraph(),
        images: [faker.image.url()],           // ✅ updated
        likes: [],
        comments: [],
      });
      await post.save();
    }

    console.log("Database seeded successfully ✅");
    process.exit();
  } catch (err) {
    console.error("Seeding error ❌", err);
    process.exit(1);
  }
};

seedData();
