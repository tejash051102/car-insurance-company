import { Navigate } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage.js";

const ProtectedRoute = ({ children }) => {
  const userInfo = getAuthUser();

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
