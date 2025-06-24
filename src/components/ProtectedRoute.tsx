import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  role?: 'barber' | 'customer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role, if specified
  if (role && user.role !== role) {
    // Redirect to their appropriate dashboard
    const redirectPath = user.role === 'barber' ? '/barber' : '/customer';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
