import React from 'react';
import { Link } from 'react-router-dom';

export default function BoardList({ boards }) {
  if (!boards.length) {
    return <p className="empty-text">No boards have been configured yet.</p>;
  }

  return (
    <div className="board-grid">
      {boards.map((b) => (
        <Link key={b.slug} to={`/${b.slug}`} className="board-card">
          <div className="slug">/{b.slug}/ — {b.title}</div>
          <div className="desc">{b.description}</div>
        </Link>
      ))}
    </div>
  );
}
