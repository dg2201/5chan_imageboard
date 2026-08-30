import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ crumbs = [] }) {
  return (
    <header className="site-header">
      <h1 className="site-title">
        5chan <small>// anonymous imageboard</small>
      </h1>
      <div className="crumb-trail">
        <Link to="/">boards</Link>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className="sep">/</span>
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
          </React.Fragment>
        ))}
      </div>
    </header>
  );
}
