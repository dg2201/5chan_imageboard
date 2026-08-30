CREATE TABLE IF NOT EXISTS boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  nsfw INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT '',
  pinned INTEGER NOT NULL DEFAULT 0,
  locked INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  bumped_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  is_op INTEGER NOT NULL DEFAULT 0,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  tripcode TEXT,
  body TEXT NOT NULL DEFAULT '',
  image_path TEXT,
  image_original_name TEXT,
  image_width INTEGER,
  image_height INTEGER,
  poster_ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT UNIQUE NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT
);

CREATE TABLE IF NOT EXISTS post_rate_log (
  ip_hash TEXT PRIMARY KEY,
  last_post_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_threads_board ON threads(board_id, bumped_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_thread ON posts(thread_id, id ASC);
CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(board_id);
