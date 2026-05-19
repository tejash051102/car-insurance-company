import { Navigate, useLocation } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage.js";

const ProtectedRoute = ({ children }) => {
  const userInfo = getAuthUser();
  const location = useLocation();

  if (!userInfo) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
