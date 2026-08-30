import path from 'path';
import fs from 'fs/promises';
import db from '../db/database.js';
import { sanitizeBody, sanitizeName, sanitizeSubject } from '../utils/sanitize.js';
import { parseNameAndTripcode } from '../utils/tripcode.js';
import { processAndStoreImage } from '../utils/imageProcessing.js';
import { recordPost } from '../middleware/rateLimiter.js';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_THREADS_PER_BOARD = 150;

export function listThreads(req, res) {
  const board = db.prepare('SELECT id FROM boards WHERE slug = ?').get(req.params.boardSlug);
  if (!board) return res.status(404).json({ error: 'Board not found' });

  const threads = db
    .prepare(
      `SELECT t.id, t.subject, t.pinned, t.locked, t.reply_count, t.bumped_at,
              p.author_name, p.tripcode, p.body, p.image_path, p.image_width, p.image_height, p.created_at
       FROM threads t
       JOIN posts p ON p.thread_id = t.id AND p.is_op = 1
       WHERE t.board_id = ?
       ORDER BY t.pinned DESC, t.bumped_at DESC
       LIMIT ?`
    )
    .all(board.id, MAX_THREADS_PER_BOARD);

  res.json({ threads });
}

export function getThread(req, res) {
  const thread = db.prepare('SELECT * FROM threads WHERE id = ?').get(req.params.threadId);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  const posts = db
    .prepare(
      `SELECT id, is_op, author_name, tripcode, body, image_path, image_width, image_height, created_at
       FROM posts WHERE thread_id = ? ORDER BY id ASC`
    )
    .all(thread.id);

  res.json({ thread, posts });
}

export async function createThread(req, res, next) {
  try {
    const board = db.prepare('SELECT id FROM boards WHERE slug = ?').get(req.params.boardSlug);
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (!req.file) {
      return res.status(400).json({ error: 'An image is required to start a thread' });
    }

    const { displayName, tripcode } = parseNameAndTripcode(req.body.name);
    const subject = sanitizeSubject(req.body.subject || '');
    const bodyText = sanitizeBody(req.body.body);

    const finalFilename = `${uuidv4()}.jpg`;
    const finalPath = path.resolve(process.cwd(), UPLOAD_DIR, finalFilename);
    const imageMeta = await processAndStoreImage(req.file.path, finalPath);

    const insertThread = db.prepare(
      'INSERT INTO threads (board_id, subject) VALUES (?, ?)'
    );
    const threadResult = insertThread.run(board.id, subject);
    const threadId = threadResult.lastInsertRowid;

    const insertPost = db.prepare(
      `INSERT INTO posts (thread_id, board_id, is_op, author_name, tripcode, body, image_path,
        image_original_name, image_width, image_height, poster_ip_hash)
       VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insertPost.run(
      threadId,
      board.id,
      sanitizeName(displayName),
      tripcode,
      bodyText,
      finalFilename,
      req.file.originalname,
      imageMeta.width,
      imageMeta.height,
      req.ipHash
    );

    pruneOldThreads(board.id);
    recordPost(req.ipHash);

    res.status(201).json({ threadId });
  } catch (err) {
    next(err);
  }
}

function pruneOldThreads(boardId) {
  const excess = db
    .prepare(
      `SELECT id FROM threads WHERE board_id = ? AND pinned = 0
       ORDER BY bumped_at DESC LIMIT -1 OFFSET ?`
    )
    .all(boardId, MAX_THREADS_PER_BOARD);

  const deleteThread = db.prepare('DELETE FROM threads WHERE id = ?');
  for (const t of excess) deleteThread.run(t.id);
}
