import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div />; // keep simple; App may render a global loader
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
