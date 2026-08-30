import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import app from './app.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const PORT = process.env.PORT || 4000;

fs.mkdirSync(path.resolve(process.cwd(), UPLOAD_DIR, 'tmp'), { recursive: true });

app.listen(PORT, () => {
  console.log(`5chan backend listening on port ${PORT}`);
});
