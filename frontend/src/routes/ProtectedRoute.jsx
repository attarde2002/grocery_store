import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, requiredRole, children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // 1. If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Normalize roles check (supports single requiredRole or array allowedRoles)
  const roles = allowedRoles || (requiredRole ? [requiredRole] : null);

  if (roles && !roles.includes(userRole)) {
    // Redirect to /products because /home route does not exist in AppRoutes.jsx
    return <Navigate to="/products" replace />;
  }

  // 3. Render children if wrapped around a component, otherwise render Outlet for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;