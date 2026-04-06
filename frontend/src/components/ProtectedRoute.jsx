import { Navigate } from 'react-router-dom';
import { getRole, getToken } from '../lib/auth.js';

export default function ProtectedRoute({ allowRoles = [], children }) {
  const token = getToken();
  const role = getRole();

  if (!token) return <Navigate to="/" replace />;
  if (allowRoles.length > 0 && !allowRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

