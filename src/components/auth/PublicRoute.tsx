import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
