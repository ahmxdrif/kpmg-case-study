import { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';

function ConsultantsPage() {
  const [consultants, setConsultants] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchConsultants = async (query = '') => {
    try {
      const res = await api.get(`/consultants/${query ? `?search=${query}` : ''}`);
      setConsultants(res.data.results);
    } catch (err) {
      setError('Could not load consultants.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchConsultants(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Consultants</h2>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
            <SearchBar value={search} onChange={setSearch} onSearch={() => fetchConsultants(search)} placeholder="Search consultants..." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {consultants.map((c) => (
          <Card key={c.id}>
            <div style={{ fontWeight: 600 }}>{c.username}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Weekly capacity: {c.weekly_hours_capacity || 0}h
            </div>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              <strong>Projects:</strong>{' '}
              {c.projects.length > 0 ? c.projects.join(', ') : 'None assigned'}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ConsultantsPage;