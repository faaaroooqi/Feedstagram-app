import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import MyPosts from "./pages/MyPosts";   // ✅ import your page
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Navbar from "./components/Navbar";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import PublicRoute from "./components/PublicRoute"
import { useContext } from "react";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute><Profile /></ProtectedRoute>
                
            
            }
          />
          <Route
            path="/my-posts"
            element={
              <ProtectedRoute>
                <MyPosts />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
