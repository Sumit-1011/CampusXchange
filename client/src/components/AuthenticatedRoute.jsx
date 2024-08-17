import { Navigate } from "react-router-dom";

const AuthenticatedRoute = ({ element }) => {
  const token = localStorage.getItem("token");

  const userId = localStorage.getItem("userId");

  if (!token && !userId) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default AuthenticatedRoute;
