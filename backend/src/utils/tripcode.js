import crypto from 'crypto';

const TRIP_SALT = process.env.TRIPCODE_SALT || 'dev_salt_change_me';

export function parseNameAndTripcode(rawName) {
  const source = rawName || 'Anonymous';
  const hashIndex = source.indexOf('#');

  if (hashIndex === -1) {
    return { displayName: source, tripcode: null };
  }

  const displayName = source.slice(0, hashIndex).trim() || 'Anonymous';
  const secret = source.slice(hashIndex + 1);

  if (!secret) {
    return { displayName, tripcode: null };
  }

  const digest = crypto
    .createHmac('sha256', TRIP_SALT)
    .update(secret)
    .digest('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 10);

  return { displayName, tripcode: `!${digest}` };
}
