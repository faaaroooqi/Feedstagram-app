import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

// ✅ Create a new post
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: "At least one image is required ❌" });
    }

    const imageUrls = req.files.map((file) => file.path);

    const post = new Post({
      user: req.user.id,
      text,
      images: imageUrls,
    });

    await post.save();

    // ✅ populate user so frontend has username/profilePic
    await post.populate("user", "username profilePic");

    res.json({ msg: "Post created successfully ✅", post });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};



// ✅ Get all posts (paginated)
export const getPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const lastId = req.query.lastId; // cursor (last post user has)
    const query = {};

    if (lastId) {
      // Fetch posts created before the lastId
      query._id = { $lt: lastId };
    }

    const posts = await Post.find(query)
      .populate("user", "username profilePic")
       .populate("likes", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePic" },
      })
      .sort({ createdAt: -1 }) // newest first
      .limit(limit + 1); // fetch one extra to check if there's more

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop(); // remove extra doc

    res.json({
      posts,
      hasMore,
      nextCursor: posts.length > 0 ? posts[posts.length - 1]._id : null,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};

// ✅ Update a post (caption, etc.)
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found ❌" });

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized ❌" });
    }

    // Update and repopulate
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("user", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePic" },
      });

    res.json({ msg: "Post updated ✅", post: updatedPost });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};

// ✅ Delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found ❌" });

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized ❌" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: "Post deleted ✅" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};

// ✅ Like/Unlike a post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found ❌" });

    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user.id
      );
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();

     if (!post.user.equals(req.user.id)) {
      await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        type: "like_post",
        post: post._id,
  });
}

    // Repopulate before sending
    const populatedPost = await Post.findById(post._id)
      .populate("user", "username profilePic")
      .populate("likes", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePic" },
      });

    res.json({ msg: "Post updated ✅", post: populatedPost });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
 
};

// ✅ Get posts of logged-in user
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "username profilePic")
      .populate("likes", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePic" },
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};
