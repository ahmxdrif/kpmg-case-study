import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

function Dashboard() {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/metrics/')
      .then((res) => setMetrics(res.data))
      .catch(() => setError('Could not load dashboard metrics.'));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {user?.is_consultant && (
            <>
              <Button onClick={() => navigate('/timesheets/submit')}>Submit Timesheet</Button>
              <Button variant="secondary" onClick={() => navigate('/tasks')}>View Tasks</Button>
            </>
          )}
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!metrics && !error && <p>Loading...</p>}

      {metrics && metrics.detail && <p style={{ color: 'var(--text-secondary)' }}>{metrics.detail}</p>}

      {metrics && !metrics.detail && user?.is_project_manager && <PmDashboard metrics={metrics} />}
      {metrics && !metrics.detail && user?.is_consultant && <ConsultantDashboard metrics={metrics} />}
    </div>
  );
}

function PmDashboard({ metrics }) {
  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
        {metrics.project_title} — {metrics.client_name}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Card><MetricContent label="Consultants" value={metrics.total_consultants} /></Card>
        <Card><MetricContent label="Total Tasks" value={metrics.total_tasks} /></Card>
        <Card><MetricContent label="Tasks Pending" value={metrics.tasks_pending} /></Card>
        <Card><MetricContent label="Tasks Completed" value={metrics.tasks_completed} /></Card>
        <Card><MetricContent label="Ahead of Deadline" value={metrics.tasks_ahead_of_deadline} /></Card>
      </div>
    </div>
  );
}

function ConsultantDashboard({ metrics }) {
  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
        {metrics.project_title ? (
          <>Assigned to <strong>{metrics.project_title}</strong> — PM: {metrics.project_manager_username} ({metrics.project_manager_email})</>
        ) : (
          'You are not currently assigned to a project.'
        )}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 500 }}>
        <Card><MetricContent label="Total Tasks" value={metrics.total_tasks} /></Card>
        <Card><MetricContent label="Pending" value={metrics.tasks_pending} /></Card>
        <Card><MetricContent label="Completed" value={metrics.tasks_completed} /></Card>
        <Card><MetricContent label="Ahead of Deadline" value={metrics.tasks_ahead_of_deadline} /></Card>
      </div>
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

export default Dashboard;