import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import BoardList from '../components/BoardList.jsx';
import { getBoards } from '../api/client.js';

export default function Home() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBoards()
      .then((data) => setBoards(data.boards))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <Header />
      {error && <div className="error-banner">{error}</div>}
      {loading ? <p className="loading-text">Loading boards...</p> : <BoardList boards={boards} />}
      <div className="footer-note">5chan — an educational anonymous imageboard implementation</div>
    </div>
  );
}
