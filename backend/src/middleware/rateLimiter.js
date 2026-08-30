import rateLimit from 'express-rate-limit';
import db from '../db/database.js';
import { hashIp } from '../utils/sanitize.js';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Slow down.' },
});

export const postLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You are posting too frequently. Try again shortly.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

const COOLDOWN_SECONDS = Number(process.env.POST_COOLDOWN_SECONDS || 30);

export function postCooldown(req, res, next) {
  const ipHash = hashIp(req.ip);
  const row = db.prepare('SELECT last_post_at FROM post_rate_log WHERE ip_hash = ?').get(ipHash);

  if (row) {
    const elapsedMs = Date.now() - new Date(row.last_post_at + 'Z').getTime();
    const remaining = COOLDOWN_SECONDS - Math.floor(elapsedMs / 1000);
    if (remaining > 0) {
      return res.status(429).json({ error: `Please wait ${remaining}s before posting again.` });
    }
  }

  req.ipHash = ipHash;
  next();
}

export function recordPost(ipHash) {
  db.prepare(
    `INSERT INTO post_rate_log (ip_hash, last_post_at) VALUES (?, datetime('now'))
     ON CONFLICT(ip_hash) DO UPDATE SET last_post_at = datetime('now')`
  ).run(ipHash);
}
