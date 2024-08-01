// AuthenticatedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const AuthenticatedRoute = ({ element }) => {
  const token = localStorage.getItem("token");

  return token ? element : <Navigate to="/login" />;
};

export default AuthenticatedRoute;
