import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import PostForm from '../components/PostForm.jsx';
import Post from '../components/Post.jsx';
import { getThreads, createThread, deleteThread as apiDeleteThread, banPoster } from '../api/client.js';
import { useAdmin } from '../api/AdminContext.jsx';

export default function Board() {
  const { boardSlug } = useParams();
  const { isAdmin } = useAdmin();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadThreads = useCallback(() => {
    setLoading(true);
    getThreads(boardSlug)
      .then((data) => setThreads(data.threads))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [boardSlug]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  async function handleNewThread(formData) {
    setSubmitting(true);
    try {
      await createThread(boardSlug, formData);
      loadThreads();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteThread(threadId) {
    if (!window.confirm('Delete this entire thread?')) return;
    await apiDeleteThread(threadId);
    loadThreads();
  }

  async function handleBanPoster(postId) {
    const reason = window.prompt('Ban reason:', 'Rule violation');
    if (reason === null) return;
    await banPoster(postId, reason, null);
    alert('Poster banned.');
  }

  return (
    <div className="app-shell">
      <Header crumbs={[{ label: `/${boardSlug}/` }]} />

      <PostForm mode="thread" onSubmit={handleNewThread} submitting={submitting} />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading threads...</p>
      ) : threads.length === 0 ? (
        <p className="empty-text">No threads yet. Be the first to post.</p>
      ) : (
        <div className="thread-list">
          {threads.map((t) => (
            <div key={t.id} className="thread-card">
              {t.subject && <div className="thread-subject">{t.subject}</div>}
              <Post
                post={t}
                isAdmin={isAdmin}
                onDeletePost={() => handleDeleteThread(t.id)}
                onBanPoster={handleBanPoster}
              />
              <div className="reply-count">
                {t.reply_count} {t.reply_count === 1 ? 'reply' : 'replies'}
                {' · '}
                <Link className="open-thread" to={`/${boardSlug}/thread/${t.id}`}>
                  open thread
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
