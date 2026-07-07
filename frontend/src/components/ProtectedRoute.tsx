import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../api/authApi';

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="empty-state">Loading...</div>;
  if (!session) return <Navigate to="/sign-in" replace />;
  if (roles && !session.roles.some((r) => roles.includes(r))) {
    return <div className="error-state">You do not have permission to view this page.</div>;
  }
  return <>{children}</>;
}
