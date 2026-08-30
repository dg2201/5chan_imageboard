import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || './data/5chan.db';
const resolvedPath = path.resolve(process.cwd(), dbPath);

fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

const defaultBoards = [
  ['b', 'Random', 'Anything goes', 0],
  ['g', 'Technology', 'Programming, hardware, software', 0],
  ['v', 'Video Games', 'Games and gaming culture', 0],
];

const insertBoard = db.prepare(
  'INSERT OR IGNORE INTO boards (slug, title, description, nsfw) VALUES (?, ?, ?, ?)'
);

const seedBoards = db.transaction((boards) => {
  for (const b of boards) insertBoard.run(...b);
});

seedBoards(defaultBoards);

export default db;
