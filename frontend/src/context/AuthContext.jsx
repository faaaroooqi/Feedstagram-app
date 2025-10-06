// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // load theme synchronously on first render to avoid flicker
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  const [user, setUser] = useState(null);

  // restore user/token on mount (do NOT change theme here)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Auth restore error:", err);
    }
  }, []);

  // persist theme + apply classes (independent from user)
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch (err) {
      // ignore if write fails (e.g. private mode)
    }

    if (theme === "dark") {
      document.body.classList.add("bg-black", "text-white");
    } else {
      document.body.classList.remove("bg-black", "text-white");
    }
  }, [theme]);

  const login = (userData, token) => {
    setUser(userData);
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      // keep theme as-is (it was loaded from localStorage already)
    } catch (err) {
      console.error("Login storage error:", err);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("theme"); // clear saved theme on logout
    } catch (err) {
      console.error("Logout storage error:", err);
    }
    setTheme("light"); // reset UI to default
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
}
