import db from '../db/database.js';
import { hashIp } from '../utils/sanitize.js';

export function checkBanned(req, res, next) {
  const ipHash = hashIp(req.ip);
  const ban = db
    .prepare(
      `SELECT * FROM bans WHERE ip_hash = ? AND (expires_at IS NULL OR expires_at > datetime('now'))`
    )
    .get(ipHash);

  if (ban) {
    return res.status(403).json({ error: `You are banned. Reason: ${ban.reason || 'No reason given'}` });
  }

  next();
}
