import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

const TS_COLORS = { pending_review: 'yellow', approved: 'green', rejected: 'red' };

function TimesheetsPage() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const fetchTimesheets = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (user?.is_project_manager && user?.project_id) params.append('project', user.project_id);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await api.get(`/timesheets/${query}`);
      setTimesheets(res.data.results);
    } catch (err) {
      setError('Could not load timesheets.');
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, [statusFilter, user]);

  const handleAction = async (id, action) => {
    setActingId(id);
    setError('');
    try {
      await api.post(`/timesheets/${id}/${action}/`);
      fetchTimesheets();
    } catch (err) {
      setError(`Could not ${action} timesheet.`);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>{user?.is_consultant ? 'My Timesheets' : 'Timesheets'}</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        >
          <option value="all">All statuses</option>
          <option value="pending_review">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {timesheets.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No timesheets found.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {timesheets.map((ts) => (
          <Card key={ts.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{ts.date} — {ts.hours_worked}h</div>
                {ts.notes && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{ts.notes}</div>}
                {ts.attachment && (
                <a href={ts.attachment} target="_blank" rel="noreferrer">
                    View attachment
                </a>
                )}
              </div>
              <Badge color={TS_COLORS[ts.status] || 'gray'}>{ts.status.replace('_', ' ')}</Badge>
            </div>

            {user?.is_project_manager && ts.status === 'pending_review' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button onClick={() => handleAction(ts.id, 'approve')} disabled={actingId === ts.id}>
                  Approve
                </Button>
                <Button variant="danger" onClick={() => handleAction(ts.id, 'reject')} disabled={actingId === ts.id}>
                  Reject
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TimesheetsPage;
