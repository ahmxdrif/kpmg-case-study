import { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';

function Consultants() {
  const [consultants, setConsultants] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const res = await api.get('/consultants/');
        setConsultants(res.data.results);
      } catch (err) {
        setError('Could not load consultants.');
      }
    };
    fetchConsultants();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Consultants</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {consultants.map((c) => (
          <Card key={c.id}>
            <div style={{ fontWeight: 600 }}>{c.user}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Weekly capacity: {c.weekly_hours_capacity}h
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Consultants;