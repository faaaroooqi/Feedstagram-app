import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
const token = localStorage.getItem("token");
function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);

  // If no user is logged in → redirect to login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
