import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RoleRoute({ allow, children }) {
  const { user } = useAuth();

  const isAllowed =
    (allow.includes('pm') && user?.is_project_manager) ||
    (allow.includes('consultant') && user?.is_consultant);

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;