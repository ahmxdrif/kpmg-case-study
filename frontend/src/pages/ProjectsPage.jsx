import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import SearchBar from '../components/SearchBar';

function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchProjects = async (query = '') => {
    try {
      const res = await api.get(`/projects/${query ? `?search=${query}` : ''}`);
      setProjects(res.data.results);
    } catch (err) {
      setError('Could not load projects.');
    }
  };

  useEffect(() => {
    fetchProjects();
    api.get('/clients/').then((res) => setClients(res.data.results));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProjects(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // unassigned consultants only, refetched each time the form opens
  const fetchUnassignedConsultants = async () => {
    try {
      const res = await api.get('/consultants/');
      setConsultants(res.data.results.filter((c) => !c.project));
    } catch (err) {
      setError('Could not load consultants.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects/', { title, client: clientId });
      setTitle('');
      setClientId('');
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError('Could not create project. Check the fields and try again.');
    }
  };

  const toggleExpand = (project) => {
    if (expandedId === project.id) {
      setExpandedId(null);
    } else {
      setExpandedId(project.id);
      fetchUnassignedConsultants();
    }
  };

  const isOwner = (project) => project.project_manager_username === user?.username;

  const handleAssign = async (projectId) => {
    if (!selectedConsultantId) return;
    setError('');
    try {
      await api.post(`/projects/${projectId}/assign_consultant/`, { consultant: selectedConsultantId });
      setSelectedConsultantId('');
      fetchProjects();
      fetchUnassignedConsultants();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not assign consultant.');
    }
  };

  const handleRemove = async (projectId, consultantId) => {
    setError('');
    try {
      await api.post(`/projects/${projectId}/remove_consultant/`, { consultant: consultantId });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not remove consultant.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Projects</h2>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} onSearch={() => fetchProjects(search)} placeholder="Search projects..." />

      {showForm && (
        <Card style={{ marginTop: 16, marginBottom: 20, maxWidth: 400 }}>
          <form onSubmit={handleCreate}>
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              This project will be assigned to you automatically.
            </p>
            <Button type="submit">Create</Button>
          </form>
        </Card>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {projects.map((p) => (
          <Card key={p.id} clickable>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleExpand(p)}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {p.client_name} · {p.client_industry}
                </div>
              </div>
              <span>{expandedId === p.id ? '▲' : '▼'}</span>
            </div>

            {expandedId === p.id && (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                  Assigned Consultants ({p.consultants_detail.length})
                </div>

                {p.consultants_detail.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No consultants assigned yet.</p>
                )}

                {p.consultants_detail.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                    <span style={{ fontSize: 14 }}>
                      {c.username}
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}> · assigned {new Date(c.assigned_at).toLocaleDateString()}</span>
                    </span>
                    {isOwner(p) && (
                      <Button variant="danger" onClick={() => handleRemove(p.id, c.id)}>Remove</Button>
                    )}
                  </div>
                ))}

                {isOwner(p) ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <select
                      value={selectedConsultantId}
                      onChange={(e) => setSelectedConsultantId(e.target.value)}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}
                    >
                      <option value="">Select an unassigned consultant</option>
                      {consultants.map((c) => (
                        <option key={c.id} value={c.id}>{c.username}</option>
                      ))}
                    </select>
                    <Button onClick={() => handleAssign(p.id)}>Assign</Button>
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
                    Managed by {p.project_manager_username} — you can't edit this project.
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProjectsPage;