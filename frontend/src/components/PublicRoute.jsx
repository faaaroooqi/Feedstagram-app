// src/components/PublicRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);

  // If user is logged in → redirect to feed
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicRoute;
