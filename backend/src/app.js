import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import boardsRouter from './routes/boards.js';
import threadsRouter from './routes/threads.js';
import postsRouter from './routes/posts.js';
import adminRouter from './routes/admin.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { issueCsrfToken } from './middleware/csrf.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(issueCsrfToken);
app.use(apiLimiter);

app.use('/uploads', express.static(path.resolve(process.cwd(), UPLOAD_DIR)));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/boards', boardsRouter);
app.use('/api/boards', threadsRouter);
app.use('/api/threads', postsRouter);
app.use('/api/admin', adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
