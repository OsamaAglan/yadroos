import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const tokenExpiry = localStorage.getItem("tokenExpiry");

  if (!token || !tokenExpiry) {
    return <Navigate to="/login" replace />;
  }

  const now = new Date().getTime();

  if (now > tokenExpiry) {
    // التوكين منتهي → نعمل تسجيل خروج
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
