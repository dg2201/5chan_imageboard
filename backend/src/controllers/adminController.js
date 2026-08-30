import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { hashIp } from '../utils/sanitize.js';

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function login(req, res) {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH || '');
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '4h' });

  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 4 * 60 * 60 * 1000,
  });

  res.json({ ok: true });
}

export function logout(req, res) {
  res.clearCookie('admin_session');
  res.json({ ok: true });
}

export function me(req, res) {
  res.json({ admin: true, username: req.admin.username });
}

export function deleteThread(req, res) {
  const result = db.prepare('DELETE FROM threads WHERE id = ?').run(req.params.threadId);
  if (result.changes === 0) return res.status(404).json({ error: 'Thread not found' });
  res.json({ ok: true });
}

export function deletePost(req, res) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (post.is_op) {
    db.prepare('DELETE FROM threads WHERE id = ?').run(post.thread_id);
  } else {
    db.prepare('DELETE FROM posts WHERE id = ?').run(post.id);
    db.prepare('UPDATE threads SET reply_count = reply_count - 1 WHERE id = ?').run(post.thread_id);
  }

  res.json({ ok: true });
}

export function banPosterOfPost(req, res) {
  const post = db.prepare('SELECT poster_ip_hash FROM posts WHERE id = ?').get(req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const { reason, durationHours } = req.body;
  const parsedHours = Number(durationHours);
  const expiresAt = Number.isFinite(parsedHours) && parsedHours > 0
    ? `datetime('now', '+${parsedHours} hours')`
    : 'NULL';

  db.prepare(
    `INSERT INTO bans (ip_hash, reason, expires_at) VALUES (?, ?, ${expiresAt})
     ON CONFLICT(ip_hash) DO UPDATE SET reason = excluded.reason, expires_at = excluded.expires_at`
  ).run(post.poster_ip_hash, reason || 'Rule violation');

  res.json({ ok: true });
}

export function listBans(req, res) {
  const bans = db.prepare('SELECT * FROM bans ORDER BY created_at DESC').all();
  res.json({ bans });
}

export function liftBan(req, res) {
  db.prepare('DELETE FROM bans WHERE id = ?').run(req.params.banId);
  res.json({ ok: true });
}
