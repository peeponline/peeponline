import { Navigate, useLocation } from 'react-router-dom';
import { needsProfileCompletion, useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (needsProfileCompletion(user)) {
    const isCompletionPage = location.pathname === '/dashboard' || location.pathname === '/auth/google/complete-profile';
    const hasCompletionFlag = new URLSearchParams(location.search).get('completeProfile') === 'true';

    if (location.pathname !== '/dashboard' && location.pathname !== '/auth/google/complete-profile') {
      return <Navigate to="/dashboard?completeProfile=true" replace />;
    }

    if (location.pathname === '/dashboard' && !hasCompletionFlag) {
      return <Navigate to="/dashboard?completeProfile=true" replace />;
    }
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;