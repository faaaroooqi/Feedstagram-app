import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import CommentBox from "./CommentBox";
import { useNavigate } from "react-router-dom";

function PostCard({
  post,
  isEditing = false,
  editText,
  setEditText,
  onLike,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEdit,
  onLikeComment,
  showActions = false,
}) {
  const { theme, user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();

  // ✅ slider state
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < post.images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // ✅ Find top comment (most likes → tie-breaker: latest createdAt)
  let topComment = null;

if (post.comments?.length > 0) {
  const maxLikes = Math.max(...post.comments.map(c => c.likes?.length || 0));

  if (maxLikes > 0) {
    // only consider comments that have the max number of likes
    const mostLiked = post.comments.filter(
      c => (c.likes?.length || 0) === maxLikes
    );

    // from those, pick the most recent
    topComment = mostLiked.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
  }
}


  return (
    <div
      className={`p-4 rounded shadow transition-colors duration-300
      ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}
        max-w-xl mx-auto`}
    >
      {/* User Info + Edit/Delete buttons */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate(`/profile/${post?.user?._id}`)} // ✅ click to profile
        >
          <div className="flex items-center space-x-2">
            <img
              src={post?.user?.profilePic || "https://placehold.co/40x40"}
              alt="user"
              className="w-10 h-10 rounded-full border"
            />
            <span
              className={`font-semibold ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {post?.user?.username || "Unknown"}
            </span>
          </div>
        </div>

        {/* Edit/Delete only in MyPosts (showActions=true) */}
        {showActions &&
          (user?._id === post?.user?._id || user?.id === post?.user?._id) && (
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => onSaveEdit(post._id)}
                    className="bg-green-500 px-2 py-1 text-white rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="bg-gray-500 px-2 py-1 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(post)}
                    className="bg-yellow-500 px-2 py-1 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(post._id)}
                    className="bg-red-500 px-2 py-1 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
      </div>

      {/* Post Caption */}
      {isEditing ? (
        <textarea
          className="w-full border rounded p-2 mb-3 text-black"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          autoFocus
        />
      ) : (
        <p className="mb-3">{post.text}</p>
      )}

      {/* ✅ Post Images Slider */}
      {post?.images?.length > 0 && (
        <div className="relative flex items-center justify-center">
          <img
            src={post.images[currentIndex]}
            alt={`post-${currentIndex}`}
            className="rounded-lg max-h-96 w-full object-contain"
          />

          {/* Prev Button */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 bg-gray-700 text-white px-2 py-1 rounded-full hover:bg-gray-800"
            >
              ⬅
            </button>
          )}

          {/* Next Button */}
          {currentIndex < post.images.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 bg-gray-700 text-white px-2 py-1 rounded-full hover:bg-gray-800"
            >
              ➡
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-4 text-sm mt-3">
        {!showActions && (
          <>
            <div className="relative group">
              <button
                className="hover:scale-150 transition-transform"
                onClick={() => onLike?.(post._id)}
              >
                ❤️ {post.likes?.length || 0}
              </button>

              {/* Tooltip inside the same group */}
              {post.likes?.length > 0 && (
                <div
                  className="absolute bottom-full mb-2 left-0 bg-gray-800 text-white text-xs rounded p-2 shadow-lg 
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48 max-h-40 overflow-y-auto z-10"
                >
                  {post.likes.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center space-x-2 mb-1 cursor-pointer"
                      onClick={() => navigate(`/profile/${u._id}`)} // ✅ click to profile
                    >
                      <img
                        src={u.profilePic || "https://placehold.co/20x20"}
                        alt={u.username}
                        className="w-5 h-5 rounded-full border"
                      />
                      <span className="hover:underline">{u.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className="hover:scale-150 transition-transform"
              onClick={() => setShowComments((prev) => !prev)}
            >
              💬 {post.comments?.length || 0}
            </button>
          </>
        )}
      </div>

      {/* ✅ Top Comment Preview */}
      {topComment && (
        <div className="p-2 border-t border-gray-700 mt-2">
          <p className="text-sm text-gray-400">🌟 Top Comment</p>
          <div className="flex items-start space-x-2 mt-1">
            <img
              src={topComment.user?.profilePic || "https://placehold.co/30x30"}
              alt="profile"
              className="w-6 h-6 rounded-full border cursor-pointer"
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
                onClick={() => onLikeComment(post._id, topComment._id)}
                className="text-blue-500 hover:underline text-sm"
              >
                ❤️ {topComment.likes?.length || 0}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      {showComments && (
        <CommentBox
          postId={post._id}
          comments={post.comments}
          onAddComment={onAddComment}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
          onLikeComment={onLikeComment}
        />
      )}
    </div>
  );
}

export default PostCard;
