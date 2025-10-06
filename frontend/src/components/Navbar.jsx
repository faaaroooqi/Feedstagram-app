import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api"; // ✅ for backend calls

function Navbar() {
  const { user, logout, theme, setTheme } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [themeMenu, setThemeMenu] = useState(false);

  // ✅ Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ Fetch notifications when user is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await API.get("/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, [user]);

  return (
    <nav className="bg-blue-900 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        <span role="img" aria-label="rocket" className="mr-2">🚀</span> FEEDSTAGRAM
      </Link>

      <div className="absolute left-1/2 transform -translate-x-1/2">
        <span className="text-xl">SOCIALIZING JUST GOT EASIER</span>
      </div>

      <div className="relative flex items-center space-x-4">
        {user && (
          <div className="relative">
            {/* 🔔 Notifications icon */}
            <button
              className="relative"
              onClick={() => setShowNotif(!showNotif)}
            >
              🔔
              {notifications.some((n) => !n.read) && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full px-1">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotif && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded shadow max-h-60 overflow-y-auto z-50">
                {notifications.length === 0 ? (
                  <p className="p-3 text-gray-500">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`px-4 py-2 border-b hover:bg-gray-100 ${
                        !n.read ? "bg-blue-100" : ""
                      }`}
                    >
                      <p className="text-sm">
                        <strong>{n.sender?.username}</strong>{" "}
                        {n.type === "like_post" && "liked your post ❤️"}
                        {n.type === "comment_post" && "commented on your post 💬"}
                        {n.type === "like_comment" && "liked your comment 👍"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {user ? (
          <div className="relative">
            {/* Profile dropdown toggle */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <img
                src={user.profilePic || "https://via.placeholder.com/40"}
                alt="Profile"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
              <span>Hi, {user.username}</span>
            </div>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-60 bg-white text-black rounded shadow">
                <Link
                  to={`/profile/${user.id}`}
                  className="block px-4 py-2 hover:bg-gray-200"
                  onClick={() => setOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/my-posts"
                  className="block px-4 py-2 hover:bg-gray-200"
                  onClick={() => setOpen(false)}
                >
                  My Posts
                </Link>
                <Link
                  to="/"
                  className="block px-4 py-2 hover:bg-gray-200"
                  onClick={() => setOpen(false)}
                >
                  My Feed
                </Link>
                {/* Theme dropdown */}
                <div>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-200"
                    onClick={() => setThemeMenu(!themeMenu)}
                  >
                    Theme
                  </button>
                  {themeMenu && (
                    <div className="bg-gray-100">
                      <button
                        onClick={() => {
                          setTheme("light");
                          setThemeMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                      >
                        Light 🌞
                      </button>
                      <button
                        onClick={() => {
                          setTheme("dark");
                          setThemeMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-300"
                      >
                        Dark 🌙
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-200 text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="hover:scale-100">Login</Link>
            <Link to="/signup" className="hover:scale-100">Signup</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
