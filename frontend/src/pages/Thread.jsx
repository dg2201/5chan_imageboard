import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import PostForm from '../components/PostForm.jsx';
import Post from '../components/Post.jsx';
import { getThread, createPost, deletePost as apiDeletePost, banPoster } from '../api/client.js';
import { useAdmin } from '../api/AdminContext.jsx';

export default function Thread() {
  const { boardSlug, threadId } = useParams();
  const { isAdmin } = useAdmin();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadThread = useCallback(() => {
    setLoading(true);
    getThread(threadId)
      .then((data) => {
        setThread(data.thread);
        setPosts(data.posts);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [threadId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  async function handleReply(formData) {
    setSubmitting(true);
    try {
      await createPost(threadId, formData);
      loadThread();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePost(postId) {
    if (!window.confirm('Delete this post?')) return;
    await apiDeletePost(postId);
    loadThread();
  }

  async function handleBanPoster(postId) {
    const reason = window.prompt('Ban reason:', 'Rule violation');
    if (reason === null) return;
    await banPoster(postId, reason, null);
    alert('Poster banned.');
  }

  return (
    <div className="app-shell">
      <Header crumbs={[{ label: `/${boardSlug}/`, to: `/${boardSlug}` }, { label: `Thread ${threadId}` }]} />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading thread...</p>
      ) : (
        <>
          {thread?.subject && <div className="thread-subject">{thread.subject}</div>}

          <div className="thread-list">
            {posts.map((p) => (
              <div key={p.id} className="thread-card">
                <Post
                  post={p}
                  isAdmin={isAdmin}
                  onDeletePost={handleDeletePost}
                  onBanPoster={handleBanPoster}
                />
              </div>
            ))}
          </div>

          <hr className="divider" />

          {thread?.locked ? (
            <p className="empty-text">This thread is locked. No further replies.</p>
          ) : (
            <PostForm mode="reply" onSubmit={handleReply} submitting={submitting} />
          )}
        </>
      )}
    </div>
  );
}
