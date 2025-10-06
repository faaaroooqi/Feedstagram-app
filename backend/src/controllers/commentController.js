import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";

// ✅ Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found ❌" });

    const comment = new Comment({
      user: req.user.id,
      post: postId,
      text,
    });

    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    
     if (!post.user.equals(req.user.id)) {
     await Notification.create({
    recipient: post.user,
    sender: req.user.id,
    type: "comment_post",
    post: post._id,
       });
     }

    // ✅ Return updated populated post
    const updatedPost = await Post.findById(post._id)
      .populate("user", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePic" },
      });



    res.json({ msg: "Comment added ✅", post: updatedPost });

  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
 
};

// ✅ Like/Unlike a comment
export const likeComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ msg: "Comment not found ❌" });

    let action = "";
    if (comment.likes.includes(req.user.id)) {
      comment.likes = comment.likes.filter(
        (userId) => userId.toString() !== req.user.id
      );
      action = "unlike";
    } else {
      comment.likes.push(req.user.id);
      action = "like";
    }

    await comment.save();

    // 🔔 Only notify if user actually liked (not unlike) and isn’t liking own comment
    if (action === "like" && !comment.user.equals(req.user.id)) {
      await Notification.create({
        recipient: comment.user,
        sender: req.user.id,
        type: "like_comment",
        post: comment.post,
        comment: comment._id,
      });
    }

    // ✅ Return updated populated post
    const updatedPost = await Post.findById(comment.post)
      .populate("user", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePic" },
      });

    res.json({ msg: "Comment like toggled ❤️", post: updatedPost });
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};

// ✅ Update a comment
export const updateComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const { text } = req.body;

    let comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found ❌" });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized ❌" });
    }

    comment.text = text || comment.text;
    await comment.save();

    // ✅ Return updated populated post
    const updatedPost = await Post.findById(comment.post)
      .populate("user", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePic" },
      });

    res.json({ msg: "Comment updated ✅", post: updatedPost });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};

// ✅ Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found ❌" });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized ❌" });
    }

    await Comment.findByIdAndDelete(commentId);

    // also remove from Post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    // ✅ Return updated populated post
    const updatedPost = await Post.findById(comment.post)
      .populate("user", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePic" },
      });

    res.json({ msg: "Comment deleted ✅", post: updatedPost });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ msg: "Server error ❌", error: error.message });
  }
};
