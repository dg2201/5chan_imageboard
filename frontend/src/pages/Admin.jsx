import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import { useAdmin } from '../api/AdminContext.jsx';
import { adminLogin, adminLogout, listBans, liftBan } from '../api/client.js';

export default function Admin() {
  const { isAdmin, checked, setIsAdmin } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [bans, setBans] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      listBans().then((data) => setBans(data.bans)).catch(() => {});
    }
  }, [isAdmin]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      await adminLogin(username, password);
      setIsAdmin(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogout() {
    await adminLogout();
    setIsAdmin(false);
  }

  async function handleLiftBan(banId) {
    await liftBan(banId);
    setBans((prev) => prev.filter((b) => b.id !== banId));
  }

  if (!checked) {
    return (
      <div className="app-shell">
        <Header crumbs={[{ label: 'admin' }]} />
        <p className="loading-text">Checking session...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="app-shell">
        <Header crumbs={[{ label: 'admin' }]} />
        <form className="admin-login-form" onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          {error && <div className="error-banner">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn" style={{ width: '100%' }}>
            Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header crumbs={[{ label: 'admin' }]} />
      <div className="status-banner">Logged in as admin.</div>
      <button className="btn btn-outline" onClick={handleLogout}>
        Log Out
      </button>

      <h3 style={{ marginTop: 28 }}>Active Bans</h3>
      {bans.length === 0 ? (
        <p className="empty-text">No active bans.</p>
      ) : (
        <div className="ban-list">
          {bans.map((b) => (
            <div key={b.id} className="ban-row">
              <span>{b.ip_hash} — {b.reason}</span>
              <button className="btn btn-danger" onClick={() => handleLiftBan(b.id)}>
                Lift
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
