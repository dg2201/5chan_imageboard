import { Router } from 'express';
import { listBoards, getBoard } from '../controllers/boardsController.js';

const router = Router();

router.get('/', listBoards);
router.get('/:boardSlug', getBoard);

export default router;
