import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireOnboarding?: boolean;
  requireUsername?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireOnboarding = true,
  requireUsername = true 
}: ProtectedRouteProps) => {
  const { session, loading, profile } = useUserStore();
  const location = useLocation();

  // Show loading spinner only if we are loading AND we don't have a session yet.
  // If we have a session but are "loading" (e.g. background refresh), we can show the content.
  if (loading && !session) {
    return <LoadingSpinner size="large" />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check onboarding status if required
  if (requireOnboarding && profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Check username if required (skip for profile setup page itself)
  if (requireUsername && profile && !profile.username && location.pathname !== '/profilesetup') {
    return <Navigate to="/profilesetup" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};


export const PublicRoute = ({ children }: { children?: React.ReactNode }) => {
  const { session, loading, setLoading } = useUserStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safety timeout para evitar loading infinito en rutas públicas
  useEffect(() => {
    if (loading && !session) {
      timeoutRef.current = setTimeout(() => {
        console.warn('PublicRoute timeout - forcing loading to false');
        setLoading(false);
      }, 20000); // 20 segundos
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, session, setLoading]);

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
