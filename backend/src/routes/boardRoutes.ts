import { Router } from 'express';
import { getBoardById, createList, createCard, moveCard, createBoard, getBoards } from '../controllers/boardController.js';

const router = Router();

router.get('/', getBoards);        
router.post('/', createBoard);
router.get('/:id', getBoardById);
router.post('/:boardId/lists', createList);
router.post('/:boardId/cards', createCard);
router.patch('/:boardId/move-card', moveCard);

export default router;