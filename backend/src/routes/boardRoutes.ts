import { Router } from 'express';
import { createList, createCard, moveCard } from '../controllers/boardController.js';
import { getBoards, createBoard, getBoardById, joinBoardTeam } from '../controllers/boardController.js';
import { register, login } from '../controllers/authController.js';
import { requireAuth } from '../config/authMiddleware.js';

const router = Router();

// Public
router.post('/auth/register', register);
router.post('/auth/login', login);

// Protected
router.get('/', requireAuth, getBoards);
router.post('/', requireAuth, createBoard);
router.get('/:id', requireAuth, getBoardById);
router.post('/:id/join', requireAuth, joinBoardTeam);      // 👈 was missing
router.post('/:boardId/lists', requireAuth, createList);
router.post('/:boardId/cards', requireAuth, createCard);
router.patch('/:boardId/move-card', requireAuth, moveCard);

export default router;