import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';

const STATUS_COLORS = { pending: 'yellow', complete: 'green', ahead_of_deadline: 'gray' };
const STATUS_LABELS = { pending: 'Pending', complete: 'Completed', ahead_of_deadline: 'Ahead of Deadline' };

function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [assignedConsultant, setAssignedConsultant] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTasks = async () => {
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/tasks/${query}`);
      setTasks(res.data.results);
    } catch (err) {
      setError('Could not load tasks.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  useEffect(() => {
    if (user?.is_project_manager) {
      // consultants on the PM's own project only — pulled via project_id from /api/me/
      api.get(`/consultants/?project=${user.project_id}`).then((res) => setConsultants(res.data.results));
    }
  }, [user]);

  const handleComplete = async (taskId) => {
    setUpdatingId(taskId);
    setError('');
    try {
      await api.patch(`/tasks/${taskId}/`, { status: 'complete' });
      fetchTasks();
    } catch (err) {
      setError('Could not update task.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await api.post('/tasks/', {
        title,
        description,
        priority,
        deadline_at: deadline || null,
        consultant: assignedConsultant,
        project: user.project_id,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDeadline('');
      setAssignedConsultant('');
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError('Could not create task. Check the fields and try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>{user?.is_consultant ? 'My Tasks' : 'Tasks'}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="ahead_of_deadline">Ahead of Deadline</option>
            <option value="complete">Completed</option>
          </select>
          {user?.is_project_manager && (
            <Button onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Cancel' : '+ New Task'}
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20, maxWidth: 420 }}>
          <form onSubmit={handleCreate}>
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <Input label="Deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Assign to</label>
              <select
                value={assignedConsultant}
                onChange={(e) => setAssignedConsultant(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              >
                <option value="">Select a consultant</option>
                {consultants.map((c) => (
                  <option key={c.id} value={c.id}>{c.username}</option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Task'}
            </Button>
          </form>
        </Card>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tasks.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {tasks.map((t) => (
          <Card key={t.id} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <Badge color={STATUS_COLORS[t.status] || 'gray'}>{STATUS_LABELS[t.status] || t.status}</Badge>
            </div>

            <div style={{ fontWeight: 600, marginBottom: 8, paddingRight: 80 }}>{t.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {t.description || 'No description provided.'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Priority: {t.priority}
            </div>
            {t.deadline_at && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Deadline: {new Date(t.deadline_at).toLocaleString()}
              </div>
            )}

            {user?.is_consultant && t.status !== 'complete' && (
              <Button onClick={() => handleComplete(t.id)} disabled={updatingId === t.id}>
                {updatingId === t.id ? 'Updating...' : 'Set as Completed'}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TasksPage;