import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!user) return <Navigate to="/signin" state={{ from: loc.pathname }} replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!user) return <Navigate to="/signin" state={{ from: loc.pathname }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
