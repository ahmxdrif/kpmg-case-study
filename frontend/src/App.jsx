import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';
import ProtectedRoute from './ProtectedRoute';
import Layout from './components/Layout';

function ProfilePlaceholder() {
  return <h2>Profile (coming next)</h2>;
}
function ProjectsPlaceholder() {
  return <h2>Projects (coming next)</h2>;
}
function TasksPlaceholder() {
  return <h2>Tasks (coming next)</h2>;
}
function TimesheetsPlaceholder() {
  return <h2>Timesheets (coming next)</h2>;
}
function ConsultantsPlaceholder() {
  return <h2>Consultants (coming next)</h2>;
}
function ClientsPlaceholder() {
  return <h2>Clients (coming next)</h2>;
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePlaceholder />} />
        <Route path="/projects" element={<ProjectsPlaceholder />} />
        <Route path="/tasks" element={<TasksPlaceholder />} />
        <Route path="/timesheets" element={<TimesheetsPlaceholder />} />
        <Route path="/consultants" element={<ConsultantsPlaceholder />} />
        <Route path="/clients" element={<ClientsPlaceholder />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;