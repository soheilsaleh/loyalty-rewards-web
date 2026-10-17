import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { FullPageSpinner } from '../components/Spinner';
import { useAuth } from './useAuth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
