import { Router } from 'express';
import { listThreads, getThread, createThread } from '../controllers/threadsController.js';
import { upload } from '../middleware/upload.js';
import { postLimiter, postCooldown } from '../middleware/rateLimiter.js';
import { verifyCsrfToken } from '../middleware/csrf.js';
import { checkBanned } from '../middleware/banCheck.js';
import { validateNewThread } from '../middleware/validators.js';

const router = Router();

router.get('/:boardSlug/threads', listThreads);
router.get('/threads/:threadId', getThread);

router.post(
  '/:boardSlug/threads',
  postLimiter,
  verifyCsrfToken,
  checkBanned,
  upload.single('image'),
  postCooldown,
  validateNewThread,
  createThread
);

export default router;
