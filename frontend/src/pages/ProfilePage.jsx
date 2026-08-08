import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';

function ProfilePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let url = '/projects/';
        if (user?.is_consultant) url += `?consultants=${user.consultant_id}`;
        if (user?.is_project_manager) url += `?project_manager=${user.project_manager_id}`;

        const res = await api.get(url);
        setProjects(res.data.results);
      } catch (err) {
        setError('Could not load your projects.');
      }
    };
    if (user) fetchProjects();
  }, [user]);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Profile</h2>

      <Card style={{ maxWidth: 400, marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}><strong>Username:</strong> {user?.username}</div>
        <div><strong>Role:</strong> {user?.is_project_manager ? 'Project Manager' : user?.is_consultant ? 'Consultant' : 'Unknown'}</div>
      </Card>

      <h3 style={{ marginBottom: 12 }}>
        {user?.is_project_manager ? 'Projects You Manage' : 'Projects You Are Assigned To'}
      </h3>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {projects.map((p) => (
          <Card key={p.id}>
            <div style={{ fontWeight: 600 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Project #{p.id}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProfilePage;
