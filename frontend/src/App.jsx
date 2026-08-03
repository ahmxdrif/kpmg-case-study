import { useState } from 'react';
import axios from 'axios';
import api from './api';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');

  const login = async () => {
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/api/token/', { username, password });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      setLoggedIn(true);
    } catch (err) {
      setError('Login failed. Check your username/password.');
    }
  };

  const fetchClients = async () => {
    setError('');
    try {
      const res = await api.get('/clients/');
      setClients(res.data.results); // paginated response
    } catch (err) {
      setError('Could not fetch clients. Are you logged in?');
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2>Project & Resource Management</h2>

      {!loggedIn ? (
        <div>
          <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <p>Logged in.</p>
          <button onClick={fetchClients}>Fetch clients</button>
          <ul>
            {clients.map((c) => (
              <li key={c.id}>{c.name} — {c.industry}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;