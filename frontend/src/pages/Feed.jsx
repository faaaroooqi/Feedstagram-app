import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import AddPosts from "../components/AddPosts";
import API from "../utils/api";

function Feed() {
  const { theme, token, user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef();

  // ✅ Fetch posts
  const fetchPosts = useCallback(async (cursor = null) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const res = await API.get("/posts", {
        params: { limit: 5, lastId: cursor },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (cursor) {
        setPosts((prev) => [...prev, ...res.data.posts]);
      } else {
        setPosts(res.data.posts);
      }

      setHasMore(res.data.hasMore);
      setNextCursor(res.data.nextCursor);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token]);

  // ✅ Initial load
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ✅ Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPosts(nextCursor);
        }
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchPosts, nextCursor, hasMore]);

  // ✅ Update post
  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id.toString() === updatedPost._id.toString() ? updatedPost : p
      )
    );
  };

  // ✅ Like a post
  const handleLike = async (postId) => {
    if (!postId) return;
    const currentUserId = user?.id || user?._id;

    // optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        const likes = p.likes || [];
        const alreadyLiked = likes.some(
          (l) => (l._id || l).toString() === currentUserId.toString()
        );
        const newLikes = alreadyLiked
          ? likes.filter((l) => (l._id || l).toString() !== currentUserId.toString())
          : [...likes, { _id: currentUserId, username: user?.username, profilePic: user?.profilePic }];
        return { ...p, likes: newLikes };
      })
    );

    try {
      const res = await API.post(`/posts/${postId}/like`);
      handleUpdatePost(res.data.post);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // ✅ Add comment
  const handleAddComment = async (postId, text) => {
    try {
      const res = await API.post(
        `/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleUpdatePost(res.data.post);
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  // ✅ Update comment
  const handleUpdateComment = async (postId, commentId, text) => {
    try {
      const res = await API.patch(
        `/comments/${commentId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleUpdatePost(res.data.post);
    } catch (err) {
      console.error("Update comment error:", err);
    }
  };

  // ✅ Delete comment
  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await API.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleUpdatePost(res.data.post);
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  // ✅ Like a comment
  const onLikeComment = async (postId, commentId) => {
    try {
      const res = await API.post(
        `/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleUpdatePost(res.data.post);
    } catch (err) {
      console.error("Like comment error:", err);
    }
  };

  // ✅ Add new post
const handleAddPost = async (e,fileInputRef) => {
  e.preventDefault();
  if (!newPost.trim() || images.length === 0) {
    alert("Caption and at least one image are required ❌");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("text", newPost);
    images.forEach((img) => {
      formData.append("images", img);
    });

    const res = await API.post("/posts", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setPosts([res.data.post, ...posts]);
    setNewPost("");
    setImages([]); // ✅ reset images


     if (fileInputRef?.current) {
      fileInputRef.current.value = ""; // ✅ clear file input
    }
  } catch (err) {
    console.error("Error adding post:", err);
  }
};

  return (
  <div
    className={`min-h-screen p-6 transition-colors duration-300 ${
      theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
    }`}
  >
    <h2 className="text-2xl font-bold mb-6 text-center">Your Feed</h2>

    {/* ✅ Use AddPosts for new post form */}
    <AddPosts
      user={user}
      newPost={newPost}
      setNewPost={setNewPost}
      images={images}
      setImages={setImages}
      handleAddPost={handleAddPost}
      uploading={uploading}
    />

    {/* Posts */}
    {loading ? (
      <p className="text-center">Loading posts...</p>
    ) : posts.length === 0 ? (
      <p className="text-center">No posts available yet ❌</p>
    ) : (
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onLike={handleLike}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onLikeComment={onLikeComment}
          />
        ))}

        {hasMore && (
          <div
            ref={observerRef}
            className="h-10 flex items-center justify-center text-gray-500"
          >
            {loadingMore ? "Loading more..." : "Scroll for more"}
          </div>
        )}
      </div>
    )}
  </div>
);

}

export default Feed;
