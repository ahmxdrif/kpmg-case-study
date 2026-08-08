import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

const STATUS_COLORS = { pending: 'yellow', complete: 'green', ahead_of_deadline: 'gray' };
const TS_COLORS = { pending_review: 'yellow', approved: 'green', rejected: 'red' };

function ConsultantsPage() {
  const { user } = useAuth();
  const [consultants, setConsultants] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [myProjectOnly, setMyProjectOnly] = useState(false);
  const [myProjectId, setMyProjectId] = useState(null);

  const [selected, setSelected] = useState(null);
  const [detailView, setDetailView] = useState('info'); // 'info' | 'tasks' | 'timesheets'
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchConsultants = async (query = '') => {
    try {
      const res = await api.get(`/consultants/${query ? `?search=${query}` : ''}`);
      setConsultants(res.data.results);
    } catch (err) {
      setError('Could not load consultants.');
    }
  };

  useEffect(() => {
    fetchConsultants();
    api.get('/dashboard/metrics/').then((res) => {
      // pulling my own project id off the me endpoint would be cleaner; using dashboard as a stand-in isn't reliable, so:
    });
  }, []);

  useEffect(() => {
    if (user?.project_id) setMyProjectId(user.project_id);
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => fetchConsultants(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const displayedConsultants = myProjectOnly
    ? consultants.filter((c) => c.project === myProjectId)
    : consultants;

    console.log(displayedConsultants);

  const openConsultant = (consultant) => {
    setSelected(consultant);
    setDetailView('info');
    setDetailData([]);
  };

  const isMyConsultant = (consultant) => consultant.project === myProjectId;

  const loadTasks = async () => {
    setDetailLoading(true);
    setDetailView('tasks');
    try {
      const res = await api.get(`/tasks/?consultant=${selected.id}`);
      setDetailData(res.data.results);
    } catch (err) {
      setError('Could not load tasks.');
    } finally {
      setDetailLoading(false);
    }
  };

  const loadTimesheets = async () => {
    setDetailLoading(true);
    setDetailView('timesheets');
    try {
      const res = await api.get(`/timesheets/?consultant=${selected.id}`);
      setDetailData(res.data.results);
    } catch (err) {
      setError('Could not load timesheets.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Consultants</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <SearchBar value={search} onChange={setSearch} onSearch={() => fetchConsultants(search)} placeholder="Search consultants..." />
        <Button
          variant={myProjectOnly ? 'primary' : 'secondary'}
          onClick={() => setMyProjectOnly((v) => !v)}
        >
          Assigned in my project
        </Button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {displayedConsultants.map((c) => (
          <Card key={c.id} style={{ cursor: 'pointer' }} onClick={() => openConsultant(c)}>
            <div style={{ fontWeight: 600 }}>{c.username}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Weekly capacity: {c.weekly_hours_capacity || 0}h
            </div>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              {c.project_title ? `Assigned to Project: ${c.project_title}` : 'Unassigned'}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            {detailView === 'info' && (
              <>
                <h3 style={{ marginTop: 0 }}>{selected.username}</h3>
                <p><strong>Email:</strong> {selected.email || '—'}</p>
                <p><strong>Weekly Capacity:</strong> {selected.weekly_hours_capacity}h</p>
                <p><strong>Project:</strong> {selected.project_title || 'Unassigned'}</p>

                {isMyConsultant(selected) && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button onClick={loadTasks}>View Task List</Button>
                    <Button onClick={loadTimesheets}>View Timesheets</Button>
                  </div>
                )}
              </>
            )}

            {detailView === 'tasks' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Tasks — {selected.username}</h3>
                  <Button variant="secondary" onClick={() => setDetailView('info')}>Back</Button>
                </div>
                {detailLoading && <p>Loading...</p>}
                {!detailLoading && detailData.length === 0 && <p>No tasks found.</p>}
                {detailData.map((t) => (
                  <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t.title}</span>
                      <Badge color={STATUS_COLORS[t.status] || 'gray'}>{t.status}</Badge>
                    </div>
                  </div>
                ))}
              </>
            )}

            {detailView === 'timesheets' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Timesheets — {selected.username}</h3>
                  <Button variant="secondary" onClick={() => setDetailView('info')}>Back</Button>
                </div>
                {detailLoading && <p>Loading...</p>}
                {!detailLoading && detailData.length === 0 && <p>No timesheets found.</p>}
                {detailData.map((ts) => (
                  <div key={ts.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{ts.date} — {ts.hours_worked}h</span>
                      <Badge color={TS_COLORS[ts.status] || 'gray'}>{ts.status}</Badge>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ConsultantsPage;