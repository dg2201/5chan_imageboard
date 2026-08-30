import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminProvider } from './api/AdminContext.jsx';
import Home from './pages/Home.jsx';
import Board from './pages/Board.jsx';
import Thread from './pages/Thread.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/:boardSlug" element={<Board />} />
        <Route path="/:boardSlug/thread/:threadId" element={<Thread />} />
      </Routes>
    </AdminProvider>
  );
}
