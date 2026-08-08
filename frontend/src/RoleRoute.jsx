import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RoleRoute({ allow, children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  const isAllowed =
    (allow.includes('pm') && user?.is_project_manager) || (allow.includes('consultant') && user?.is_consultant);

  if (!isAllowed) {
    console.log(user);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;