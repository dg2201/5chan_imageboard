import db from '../db/database.js';

export function listBoards(req, res) {
  const boards = db.prepare('SELECT slug, title, description, nsfw FROM boards ORDER BY slug').all();
  res.json({ boards });
}

export function getBoard(req, res) {
  const board = db
    .prepare('SELECT slug, title, description, nsfw FROM boards WHERE slug = ?')
    .get(req.params.boardSlug);

  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }

  res.json({ board });
}
