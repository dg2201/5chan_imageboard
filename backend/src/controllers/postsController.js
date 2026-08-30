import path from 'path';
import db from '../db/database.js';
import { sanitizeBody, sanitizeName } from '../utils/sanitize.js';
import { parseNameAndTripcode } from '../utils/tripcode.js';
import { processAndStoreImage } from '../utils/imageProcessing.js';
import { recordPost } from '../middleware/rateLimiter.js';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_REPLIES_PER_THREAD = 500;

export async function createPost(req, res, next) {
  try {
    const thread = db.prepare('SELECT * FROM threads WHERE id = ?').get(req.params.threadId);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    if (thread.locked) return res.status(403).json({ error: 'Thread is locked' });
    if (thread.reply_count >= MAX_REPLIES_PER_THREAD) {
      return res.status(403).json({ error: 'Thread has reached its reply limit' });
    }

    const { displayName, tripcode } = parseNameAndTripcode(req.body.name);
    const bodyText = sanitizeBody(req.body.body);

    let finalFilename = null;
    let imageMeta = { width: null, height: null };

    if (req.file) {
      finalFilename = `${uuidv4()}.jpg`;
      const finalPath = path.resolve(process.cwd(), UPLOAD_DIR, finalFilename);
      imageMeta = await processAndStoreImage(req.file.path, finalPath);
    }

    const insertPost = db.prepare(
      `INSERT INTO posts (thread_id, board_id, is_op, author_name, tripcode, body, image_path,
        image_original_name, image_width, image_height, poster_ip_hash)
       VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = insertPost.run(
      thread.id,
      thread.board_id,
      sanitizeName(displayName),
      tripcode,
      bodyText,
      finalFilename,
      req.file?.originalname || null,
      imageMeta.width,
      imageMeta.height,
      req.ipHash
    );

    db.prepare(
      `UPDATE threads SET reply_count = reply_count + 1, bumped_at = datetime('now') WHERE id = ?`
    ).run(thread.id);

    recordPost(req.ipHash);

    res.status(201).json({ postId: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
}
