import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import PostCard from "../components/PostCard";

function MyPosts() {
  const { token, theme } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await API.get("/posts/my-posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching my posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, [token]);

  // ✅ Delete post
  const handleDelete = async (id) => {
    try {
      await API.delete(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ Update post state (for edits, likes, comments, etc.)
  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  // ✅ Start editing
  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setEditText(post.text);
  };

  // ✅ Save caption edit
  const handleSaveEdit = async (id) => {
    try {
      const res = await API.patch(
        `/posts/${id}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // backend should return updated post
      handleUpdatePost(res.data.post);
      setEditingPostId(null);
      setEditText("");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // ✅ Cancel editing
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditText("");
  };

  // ✅ Like post
 const handleLike = async (id) => {
  try {
    const res = await API.post(`/posts/${id}/like`);
    const updatedPost = res.data.post;
    handleUpdatePost(updatedPost);
  } catch (err) {
    console.error("Like error:", err);
  }
};


  // ✅ Add comment
  const handleAddComment = async (id, text) => {
    try {
      const res = await API.post(
        `/posts/${id}/comments`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleUpdatePost(res.data.updatedPost);
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">My Posts</h2>
      {loading ? (
        <p className="text-center">Loading your posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-center">You haven’t created any posts yet ❌</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isEditing={editingPostId === post._id}
              editText={editText}
              setEditText={setEditText}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onDelete={handleDelete}
              onUpdatePost={handleUpdatePost}
              onEdit={handleEdit}
              onLike={handleLike}
              onAddComment={handleAddComment}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPosts;
