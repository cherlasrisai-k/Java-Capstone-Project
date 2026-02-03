import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  // Check if token exists and is not expired
  const isTokenValid = token && !isTokenExpired(token);

  if (!isTokenValid) {
    // Clear invalid tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");

    // Redirect based on stored role or default to patient
    if (role === "DOCTOR") return <Navigate to="/doctor/login" replace />;
    if (role === "ADMIN") return <Navigate to="/admin/login" replace />;
    return <Navigate to="/patient/login" replace />;
  }

  // Role mismatch
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Simple JWT expiration check
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default ProtectedRoute;