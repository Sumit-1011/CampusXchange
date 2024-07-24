import React from "react";
import { Navigate } from "react-router-dom";

const AuthenticatedRoute = ({ element }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default AuthenticatedRoute;
