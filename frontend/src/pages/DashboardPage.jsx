import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

function Dashboard() {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/dashboard/metrics/');
        setMetrics(res.data);
      } catch (err) {
        setError('Could not load dashboard metrics.');
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Dashboard</h2>
        <div>
          <span style={{ marginRight: 12 }}>
            {user?.username} {user?.is_project_manager && '(Project Manager)'} {user?.is_consultant && '(Consultant)'}
          </span>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Card><MetricContent label="Total Projects" value={metrics.total_projects} /></Card>
          <Card><MetricContent label="Total Tasks" value={metrics.total_tasks} /></Card>
          <Card><MetricContent label="Tasks Completed" value={metrics.tasks_completed} /></Card>
          <Card><MetricContent label="Tasks Pending" value={metrics.tasks_pending} /></Card>
          <Card><MetricContent label="Total Consultants" value={metrics.total_consultants} /></Card>
          <Card><MetricContent label="Total Hours Logged" value={metrics.total_hours_logged} /></Card>
        </div>
      )}

      {metrics && (
        <p style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
          {metrics.cached ? 'Loaded from cache' : 'Freshly calculated'}
        </p>
      )}
    </div>
  );
}

function MetricContent({ label, value }) {
  return (
    <>
      <div style={{ fontSize: 12, color: '#888' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 'bold' }}>{value}</div>
    </>
  );
}

export default Dashboard;