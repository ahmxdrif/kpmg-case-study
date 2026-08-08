import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Dashboard</h2>
      </div>
      {user?.is_project_manager && <PmDashboard />}
      {user?.is_consultant && <ConsultantDashboard />}
    </div>
  );
}

function PmDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/metrics/')
      .then((res) => setMetrics(res.data))
      .catch(() => setError('Could not load dashboard metrics.'));
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!metrics) return <p>Loading...</p>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Card><MetricContent label="Total Projects" value={metrics.total_projects} /></Card>
      <Card><MetricContent label="Total Tasks" value={metrics.total_tasks} /></Card>
      <Card><MetricContent label="Tasks Completed" value={metrics.tasks_completed} /></Card>
      <Card><MetricContent label="Tasks Pending" value={metrics.tasks_pending} /></Card>
      <Card><MetricContent label="Total Consultants" value={metrics.total_consultants} /></Card>
      <Card><MetricContent label="Total Hours Logged" value={metrics.total_hours_logged} /></Card>
    </div>
  );
}

function ConsultantDashboard() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tasks/')
      .then((res) => setTasks(res.data.results))
      .catch(() => setError('Could not load your tasks.'));
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'ahead_of_deadline').length;
  const completed = tasks.filter((t) => t.status === 'complete').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 500 }}>
      <Card><MetricContent label="Pending Tasks" value={pending} /></Card>
      <Card><MetricContent label="Completed Tasks" value={completed} /></Card>
    </div>
  );
}

function MetricContent({ label, value }) {
  return (
    <>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 'bold' }}>{value}</div>
    </>
  );
}

export default DashboardPage;