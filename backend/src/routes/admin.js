import { Router } from 'express';
import {
  login,
  logout,
  me,
  deleteThread,
  deletePost,
  banPosterOfPost,
  listBans,
  liftBan,
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { verifyCsrfToken } from '../middleware/csrf.js';
import { validateLogin } from '../middleware/validators.js';

const router = Router();

router.post('/login', authLimiter, verifyCsrfToken, validateLogin, login);
router.post('/logout', requireAdmin, logout);
router.get('/me', requireAdmin, me);

router.delete('/threads/:threadId', requireAdmin, verifyCsrfToken, deleteThread);
router.delete('/posts/:postId', requireAdmin, verifyCsrfToken, deletePost);
router.post('/posts/:postId/ban', requireAdmin, verifyCsrfToken, banPosterOfPost);
router.get('/bans', requireAdmin, listBans);
router.delete('/bans/:banId', requireAdmin, verifyCsrfToken, liftBan);

export default router;
