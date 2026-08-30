# 5chan

A minimal, security hardened anonymous imageboard built with React and Express. Educational project modeled loosely on classic textboard/imageboard software: boards, threads, anonymous replies, tripcodes, and lightweight moderation.

## Stack

- **Frontend:** React 18 + Vite, React Router, no UI framework — plain CSS
- **Backend:** Express, better sqlite3, Helmet, express-rate-limit, express-validator, Multer, Sharp, bcryptjs, jsonwebtoken

## Features

- Boards → Threads → Posts, anonymous by default
- Optional tripcodes (`name#password`) for identity continuity without accounts
- Image uploads with real content based validation and EXIF stripping (Sharp re-encodes every image)
- CSRF protection (double-submit cookie), per route rate limiting, per IP post cooldown
- Admin login (bcrypt + JWT httpOnly cookie) with delete post/thread and IP hash banning
- No raw IP addresses stored everything is salted-hashed

See `docs/` for a full breakdown of the build process, component architecture, and runtime behavior.

## Quick start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
node src/utils/generateAdminHash.js "your-chosen-admin-password"
```

Paste the printed hash into `.env` as `ADMIN_PASSWORD_HASH`. Also fill in `JWT_SECRET` and `TRIPCODE_SALT` with long random strings, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then start it:

```bash
npm run dev
```

Backend runs on `http://localhost:4000` and creates its SQLite database on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` and `/uploads` to the backend.

### 3. Admin panel

Visit `http://localhost:5173/admin` and log in with `ADMIN_USERNAME` / the password you hashed above.

## Production notes

This is a learning/portfolio project, not a hardened production deployment. Before deploying anywhere public, at minimum: put it behind HTTPS, move uploads to object storage, add a real backup strategy for the SQLite file (or move to Postgres), and add a captcha or proof of work step to the posting flow since the current rate limiting alone won't stop a determined script.
