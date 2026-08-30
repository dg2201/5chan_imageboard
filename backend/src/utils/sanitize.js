import crypto from 'crypto';

const IP_SALT = process.env.TRIPCODE_SALT || 'dev_salt_change_me';

export function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + IP_SALT).digest('hex').slice(0, 16);
}

export function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function stripControlChars(input) {
  return String(input).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

export function sanitizeBody(input) {
  return stripControlChars(input).trim().slice(0, 4000);
}

export function sanitizeName(input) {
  if (!input) return 'Anonymous';
  const cleaned = stripControlChars(input).trim().slice(0, 40);
  return cleaned.length > 0 ? cleaned : 'Anonymous';
}

export function sanitizeSubject(input) {
  if (!input) return '';
  return stripControlChars(input).trim().slice(0, 100);
}
