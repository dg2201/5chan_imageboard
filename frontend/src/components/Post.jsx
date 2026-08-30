import React from 'react';

export default function Post({ post, isAdmin, onDeletePost, onBanPoster }) {
  return (
    <div className="post-block">
      <div className="thread-meta">
        <span className="name">{post.author_name}</span>
        {post.tripcode && <span className="trip">{post.tripcode}</span>}
        <span>{new Date(post.created_at + 'Z').toLocaleString()}</span>
        <span>No.{post.id}</span>
      </div>

      {post.image_path && (
        <img
          className="thread-image"
          src={`/uploads/${post.image_path}`}
          alt="attached"
          width={post.image_width}
          height={post.image_height}
          loading="lazy"
        />
      )}

      <div className="thread-body">{post.body}</div>

      {isAdmin && (
        <div className="mod-controls">
          <button onClick={() => onDeletePost(post.id)}>delete</button>
          <button onClick={() => onBanPoster(post.id)}>ban poster</button>
        </div>
      )}
    </div>
  );
}
