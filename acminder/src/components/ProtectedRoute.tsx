import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function ProtectedRoute() {
  const { user, loading, isNewUser, clearNewUser } = useAppContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  // Redirect new OAuth users to onboarding (but don't loop if already on /import)
  if (isNewUser && location.pathname !== '/import') {
    clearNewUser();
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

