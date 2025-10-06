import { useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

function AddPosts({
  newPost,
  setNewPost,
  images,
  setImages,
  handleAddPost,
  uploading,
}) {
  const { theme, user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  return (
    <div
      className={`p-4 rounded shadow transition-colors duration-300
      ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}
        max-w-xl mx-auto mb-6`}
    >
      {/* User Info */}
      <div className="flex items-center space-x-2 mb-3">
        <img
          src={user?.profilePic || "https://placehold.co/40x40"}
          alt="profile"
          className="w-10 h-10 rounded-full border"
        />
        <span className="font-semibold">{user?.username || "You"}</span>
      </div>

      {/* Post textarea */}
      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border rounded p-2 text-black mb-3"
      />

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="block w-full text-sm text-gray-500 
          file:mr-3 file:py-2 file:px-4 
          file:rounded file:border-0 
          file:text-sm file:font-semibold 
          file:bg-blue-600 file:text-white 
          hover:file:bg-blue-700 mb-3"
          onChange={(e) => setImages(Array.from(e.target.files))}
      />

      {/* Image previews styled like post images */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((file, i) => (
            <img
              key={i}
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-28 h-28 object-cover rounded"
            />
          ))}
        </div>
      )}

      {/* Post button */}
      <button
        onClick={(e) => handleAddPost(e, fileInputRef)} 
        disabled={uploading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Post"}
      </button>
    </div>
  );
}

export default AddPosts;
