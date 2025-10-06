import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";

function Profile() {
  const { user: loggedInUser, login, theme } = useContext(AuthContext);
  const { id } = useParams(); // 🆕 profile owner ID from URL
  const [profileUser, setProfileUser] = useState(null); // start empty, fill later
  const [file, setFile] = useState(null);
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const isOwnProfile = !id || id === loggedInUser?.id || id === loggedInUser?._id; // 🆕 robust check

  // Fetch user if visiting someone else’s profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!isOwnProfile && id) {
          const res = await API.get(`/users/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setProfileUser(res.data.user || res.data); // 🆕 match backend response
          setBio(res.data.user?.bio || res.data.bio || "");
          setUsername(res.data.user?.username || res.data.username || "");
        } else if (loggedInUser) {
          setProfileUser(loggedInUser);
          setBio(loggedInUser.bio || "");
          setUsername(loggedInUser.username || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Profile not found ❌");
      }
    };
    fetchUser();
  }, [id, isOwnProfile, loggedInUser]);

  // Cloudinary upload
  const uploadImageToCloudinary = async () => {
    if (!file) return "";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ml_default");
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/djwmyo6j6/image/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      return result.secure_url || "";
    } catch (err) {
      console.error("Cloudinary error:", err);
      return "";
    }
  };

  const handleUpdateProfile = async () => {
    if (!isOwnProfile) return; // 🔒 prevent updates on others’ profiles
    setLoading(true);
    setError("");

    try {
      let uploadedPic = "";
      if (file) uploadedPic = await uploadImageToCloudinary();

      const res = await API.patch(
        `/users/${loggedInUser.id || loggedInUser._id}`, // 🆕 safe id access
        {
          username,
          bio,
          profilePic: uploadedPic || loggedInUser.profilePic,
          password: password || undefined,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      login(res.data.user, localStorage.getItem("token")); // update global user
      alert("Profile updated ✅");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Update failed ❌");
    }

    setLoading(false);
  };

  if (!profileUser) return <p className="text-center">Loading profile...</p>;

  return (
    <div
      className={`max-w-md mx-auto p-6 rounded shadow transition-colors duration-300 
      ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
    >
      <h2 className="text-2xl font-bold mb-4">
        {isOwnProfile ? "My Profile" : `${profileUser.username}'s Profile`}
      </h2>
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col items-center">
        <img
          src={profileUser.profilePic || "https://placehold.co/150x150"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4"
        />
      </div>

      {/* Edit toggle → only show if my own profile */}
      {isOwnProfile && (
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={isEditing}
            onChange={() => setIsEditing(!isEditing)}
          />
          <label className="font-semibold">Edit Profile</label>
        </div>
      )}

      {/* Username */}
      <div className="mt-2">
        <label className="block font-semibold mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!isEditing || !isOwnProfile}
          className={`w-full border p-2 rounded disabled:bg-gray-200 
          ${theme === "dark" ? "bg-gray-800 border-gray-600 text-gray-500" : ""}`}
        />
      </div>

      {/* Bio */}
      <div className="mt-4">
        <label className="block font-semibold mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={!isEditing || !isOwnProfile}
          className={`w-full border p-2 rounded disabled:bg-gray-200 
          ${theme === "dark" ? "bg-gray-800 border-gray-600 text-gray-500" : ""}`}
          rows="3"
        />
      </div>

      {/* Password + Profile Pic change → only for own profile */}
      {isOwnProfile && (
        <>
          <div className="mt-4">
            <label className="block font-semibold mb-1">Change Password</label>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!isEditing}
              className={`w-full border p-2 rounded disabled:bg-gray-200 
              ${theme === "dark" ? "bg-gray-800 border-gray-600 text-white" : ""}`}
            />
          </div>

          <div className="mt-6">
            <label className="block font-semibold mb-1">Change Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={!isEditing}
              className="mb-2"
            />
          </div>
        </>
      )}

      {/* Buttons */}
      <div className="space-y-2 mt-4">
        {isOwnProfile && isEditing && (
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        )}
        <button
          onClick={() => navigate("/")}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default Profile;
