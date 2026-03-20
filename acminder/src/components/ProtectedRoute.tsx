import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function ProtectedRoute() {
  const { user, loading } = useAppContext();
  if (loading) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

