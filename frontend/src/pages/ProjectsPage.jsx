import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [assignmentsByProject, setAssignmentsByProject] = useState({});
  const [selectedConsultantId, setSelectedConsultantId] = useState('');
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/');
      setProjects(res.data.results);
    } catch (err) {
      setError('Could not load projects.');
    }
  };

  const fetchAssignments = async (projectId) => {
    try {
      const res = await api.get(`/project-assignments/?project=${projectId}`);
      setAssignmentsByProject((prev) => ({ ...prev, [projectId]: res.data.results }));
    } catch (err) {
      setError('Could not load assignments.');
    }
  };

  useEffect(() => {
    fetchProjects();
    api.get('/clients/').then((res) => setClients(res.data.results));
    api.get('/consultants/').then((res) => setConsultants(res.data.results));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects/', {
        title,
        client: clientId,
        project_manager: user.project_manager_id,
      });
      setTitle('');
      setClientId('');
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError('Could not create project. Check the fields and try again.');
    }
  };

  const toggleExpand = (projectId) => {
    if (expandedId === projectId) {
      setExpandedId(null);
    } else {
      setExpandedId(projectId);
      if (!assignmentsByProject[projectId]) fetchAssignments(projectId);
    }
  };

  const handleAssign = async (projectId) => {
    if (!selectedConsultantId) return;
    setError('');
    try {
      await api.post('/project-assignments/', {
        project: projectId,
        consultant: selectedConsultantId,
      });
      setSelectedConsultantId('');
      fetchAssignments(projectId);
    } catch (err) {
      setError('Could not assign consultant. They may already be assigned.');
    }
  };

  const handleRemove = async (assignmentId, projectId) => {
    setError('');
    try {
      await api.delete(`/project-assignments/${assignmentId}/`);
      fetchAssignments(projectId);
    } catch (err) {
      setError('Could not remove consultant.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Projects</h2>
        {user?.is_project_manager && (
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ New Project'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20, maxWidth: 400 }}>
          <form onSubmit={handleCreate}>
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Button type="submit">Create</Button>
          </form>
        </Card>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {projects.map((p) => (
          <Card key={p.id}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleExpand(p.id)}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Project #{p.id}</div>
              </div>
              <span>{expandedId === p.id ? '▲' : '▼'}</span>
            </div>

            {expandedId === p.id && (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Assigned Consultants</div>

                {(assignmentsByProject[p.id] || []).map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                    <span>Consultant #{a.consultant}</span>
                    {user?.is_project_manager && (
                      <Button variant="danger" onClick={() => handleRemove(a.id, p.id)}>Remove</Button>
                    )}
                  </div>
                ))}

                {user?.is_project_manager && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <select
                      value={selectedConsultantId}
                      onChange={(e) => setSelectedConsultantId(e.target.value)}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                    >
                      <option value="">Select a consultant to add</option>
                      {consultants.map((c) => (
                        <option key={c.id} value={c.id}>Consultant #{c.id} ({c.user})</option>
                      ))}
                    </select>
                    <Button onClick={() => handleAssign(p.id)}>Assign</Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Projects;