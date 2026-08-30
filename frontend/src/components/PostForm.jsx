import React, { useState } from 'react';

export default function PostForm({ mode, onSubmit, submitting }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'thread' && !image) {
      setError('An image is required to start a thread.');
      return;
    }

    if (!body.trim()) {
      setError('Post body cannot be empty.');
      return;
    }

    const formData = new FormData();
    if (name) formData.append('name', name);
    if (mode === 'thread' && subject) formData.append('subject', subject);
    formData.append('body', body);
    if (image) formData.append('image', image);

    try {
      await onSubmit(formData);
      setName('');
      setSubject('');
      setBody('');
      setImage(null);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {error && <div className="error-banner">{error}</div>}

      <div className="form-row">
        <input
          type="text"
          placeholder="Name (optional, use name#password for a tripcode)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {mode === 'thread' && (
          <input
            type="text"
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        )}
      </div>

      <textarea
        placeholder="Write your post..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className="form-row" style={{ marginTop: 10, alignItems: 'center' }}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setImage(e.target.files[0] || null)}
        />
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Posting...' : mode === 'thread' ? 'Start Thread' : 'Reply'}
        </button>
      </div>

      <div className="form-hint">
        {mode === 'thread'
          ? 'Image required. Max 4MB. JPEG, PNG, WEBP, or GIF only. EXIF metadata is stripped automatically.'
          : 'Image optional for replies. Same restrictions apply.'}
      </div>
    </form>
  );
}
