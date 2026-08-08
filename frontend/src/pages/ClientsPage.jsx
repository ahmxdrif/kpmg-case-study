import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

function Clients() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [industry, setIndustry] = useState('other');
    const [error, setError] = useState('');
    
    const fetchClients = async () => {
        try {
            const res = await api.get('/clients/');
            setClients(res.data.results);
        } catch (err) {
            setError('Could not load clients');
        }
    };

    useEffect(()=> {
        fetchClients();
    }, []);

    const handleCreate = async () => {
        e.preventDefault();
        setError('');
        try {
            await api.post('clients/', { name, industry });
            setName('');
            setIndustry('other');
            setShowForm(false);
            fetchClients();
        } catch (err) {
            setError('Could not create client');
        }
    };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Clients</h2>
        {user?.is_project_manager && (
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ New Client'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20, maxWidth: 400 }}>
          <form onSubmit={handleCreate}>
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              >
                <option value="oil_and_gas">Oil and Gas</option>
                <option value="banking">Banking</option>
                <option value="automotive">Automotive</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Button type="submit">Create</Button>
          </form>
        </Card>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {clients.map((c) => (
          <Card key={c.id}>
            <div style={{ fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{c.industry}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Clients;