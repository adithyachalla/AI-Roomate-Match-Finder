import { Navigate, useLocation } from "react-router-dom";

function readStoredUserId() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?._id ? String(u._id) : null;
  } catch {
    return null;
  }
}

/**
 * Requires a valid client session (JWT in localStorage + user id).
 * Optional `roles` restricts by the app role stored at login (student | owner).
 */
export default function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userId = readStoredUserId();

  if (!token || !userId) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length) {
    const role = localStorage.getItem("role") || "student";
    if (!roles.includes(role)) {
      const fallback = role === "owner" ? "/owner-dashboard" : "/student-dashboard";
      return <Navigate to={fallback} replace />;
    }
  }

  return children;
}
