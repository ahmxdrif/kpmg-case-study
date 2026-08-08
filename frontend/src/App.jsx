import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './ProtectedRoute';
import Layout from './components/Layout';
import ConsultantsPage from './pages/ConsultantsPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import RoleRoute from './RoleRoute';
import ProfilePage from './pages/ProfilePage';



function TasksPlaceholder() {
  return <h2>Tasks (coming next)</h2>;
}
function TimesheetsPlaceholder() {
  return <h2>Timesheets (coming next)</h2>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/projects"
          element={<RoleRoute allow={['pm']}><ProjectsPage /></RoleRoute>}
        />
        <Route path="/tasks" element={<TasksPlaceholder />} />
        <Route path="/timesheets" element={<TimesheetsPlaceholder />} />
        <Route
          path="/consultants"
          element={<RoleRoute allow={['pm']}><ConsultantsPage /></RoleRoute>}
        />
        <Route
          path="/clients"
          element={<RoleRoute allow={['pm']}><ClientsPage /></RoleRoute>}
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;