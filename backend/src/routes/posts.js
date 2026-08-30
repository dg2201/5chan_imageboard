import { Router } from 'express';
import { createPost } from '../controllers/postsController.js';
import { upload } from '../middleware/upload.js';
import { postLimiter, postCooldown } from '../middleware/rateLimiter.js';
import { verifyCsrfToken } from '../middleware/csrf.js';
import { checkBanned } from '../middleware/banCheck.js';
import { validateNewPost } from '../middleware/validators.js';

const router = Router();

router.post(
  '/:threadId/posts',
  postLimiter,
  verifyCsrfToken,
  checkBanned,
  upload.single('image'),
  postCooldown,
  validateNewPost,
  createPost
);

export default router;
