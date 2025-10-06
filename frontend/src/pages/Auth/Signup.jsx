import { useState, useContext } from "react";   // ✅ added useContext
import { useNavigate } from "react-router-dom"; // ✅ added useNavigate
import API from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

function Signup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    bio: "",
    profilePic: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadImageToCloudinary = async () => {
    if (!file) return "";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ml_default"); // replace with your Cloudinary preset

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/djwmyo6j6/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    const result = await res.json();
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Upload profile picture first
      const uploadedPic = await uploadImageToCloudinary();

      // Call backend signup
      const res = await API.post("/auth/signup", {
        ...formData,
        profilePic: uploadedPic || "https://via.placeholder.com/150",
      });

      if (res.data) {
        // Auto-login after signup
        const loginRes = await API.post("/auth/login", {
          username: formData.username,
          password: formData.password,
        });

        login(loginRes.data.user, loginRes.data.token);

        // ✅ Redirect to feed after signup + login
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.msg || "Signup failed ❌");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
    </div>
  );
}

export default Signup;
