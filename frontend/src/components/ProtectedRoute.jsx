<<<<<<< HEAD
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const userInfo = localStorage.getItem("userInfo");
=======
import { Navigate } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage.js";

const ProtectedRoute = ({ children }) => {
  const userInfo = getAuthUser();
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

  if (!userInfo) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
