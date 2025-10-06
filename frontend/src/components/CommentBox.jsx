import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function CommentBox({ postId, comments, onAddComment, onUpdateComment, onDeleteComment, onLikeComment }) {
  const { user } = useContext(AuthContext);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const navigate = useNavigate();

  // ✅ Add new comment
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(postId, newComment);
    setNewComment("");
  };

  // ✅ Save edit
  const handleUpdate = (id) => {
    if (!editText.trim()) return;
    onUpdateComment(postId, id, editText);
    setEditingCommentId(null);
    setEditText("");
  };

  // ✅ Delete
  const handleDelete = (id) => {
    onDeleteComment(postId, id);
  };

  // ✅ Find top comment (most likes, tie-breaker: latest createdAt)
 let topComment = null;

if (comments.length > 0) {
  // find the max number of likes
  const maxLikes = Math.max(...comments.map(c => c.likes.length));

  if (maxLikes > 0) {
    // filter only comments with that many likes
    const mostLikedComments = comments.filter(c => c.likes.length === maxLikes);

    // from those, pick the most recent
    topComment = mostLikedComments.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
  }
}
  return (
    <div className="mt-4 space-y-3">
      {/* 🌟 Top Comment */}
      {topComment && (
        <div className="p-3 border rounded bg-yellow-100 dark:bg-yellow-900">
          <p className="font-semibold text-yellow-700 dark:text-yellow-300">🌟 Top Comment</p>
          <div className="flex items-start space-x-2 mt-2">
            <img
              src={topComment.user?.profilePic || "https://placehold.co/30x30"}
              alt="profile"
              className="w-8 h-8 rounded-full border cursor-pointer"
              onClick={() => navigate(`/profile/${topComment.user?._id}`)} // ✅ click to profile
            />
            <div className="flex-1">
              <p
                className="font-semibold cursor-pointer hover:underline"
                onClick={() => navigate(`/profile/${topComment.user?._id}`)} // ✅ click to profile
              >
                {topComment.user?.username}
              </p>
              <p>{topComment.text}</p>
              <button
                onClick={() => onLikeComment(postId, topComment._id)}
                className="text-blue-500 hover:underline text-sm"
              >
                ❤️ {topComment.likes?.length || 0}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Comments (excluding top comment) */}
      {comments
        .filter((c) => c._id !== topComment?._id)
        .map((c) => (
          <div key={c._id} className="flex items-start space-x-2">
            <img
              src={c.user?.profilePic || "https://placehold.co/30x30"}
              alt="profile"
              className="w-8 h-8 rounded-full border cursor-pointer"
              onClick={() => navigate(`/profile/${c.user?._id}`)} // ✅ click to profile
            />

            <div className="flex-1">
              <p
                className="font-semibold cursor-pointer hover:underline"
                onClick={() => navigate(`/profile/${c.user?._id}`)} // ✅ click to profile
              >
                {c.user?.username}
              </p>
              {editingCommentId === c._id ? (
                <div>
                  <textarea
                    className="w-full border rounded p-1 text-black"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex space-x-2 mt-1">
                    <button
                      onClick={() => handleUpdate(c._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p>{c.text}</p>
              )}

              {/* ✅ Like button */}
              <button
                onClick={() => onLikeComment(postId, c._id)}
                className="text-blue-500 hover:underline text-sm"
              >
                ❤️ {c.likes?.length || 0}
              </button>
            </div>

            {/* Edit/Delete */}
            {c.user?._id === user?.id && editingCommentId !== c._id && (
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setEditingCommentId(c._id);
                    setEditText(c.text);
                  }}
                  className="text-yellow-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

      {/* Add new comment */}
      <form onSubmit={handleAdd} className="flex space-x-2 mt-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded px-2 py-1 text-black"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Post
        </button>
      </form>
    </div>
  );
}

export default CommentBox;
