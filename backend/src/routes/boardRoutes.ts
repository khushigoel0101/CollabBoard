import { Router } from 'express';
import { 
  getBoards, createBoard, getBoardById, joinBoardTeam,
  createList, createCard, moveCard 
    , deleteList, deleteCard, dragDeleteCard
} from '../controllers/boardController.js';
import { register, login } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validate.js';
import { requireAuth } from '../middleware/authMiddleware.js';


import { CreateBoardSchema, CreateListSchema, CreateCardSchema, MoveCardSchema } from '../config/validation.js';

const router = Router();

// ==========================================
// PUBLIC ROUTES (Authentication)
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);

// ==========================================
// PROTECTED ROUTES (Requires Auth)
// ==========================================

router.use(requireAuth);

// Board Management
router.get('/', getBoards);
router.post('/', validateRequest(CreateBoardSchema), createBoard);
router.get('/:id', getBoardById);
router.post('/:id/join', joinBoardTeam);

// List Management
router.post('/:boardId/lists', validateRequest(CreateListSchema), createList);

// Card Management
router.post('/:boardId/cards', validateRequest(CreateCardSchema), createCard);
router.patch('/:boardId/move-card', validateRequest(MoveCardSchema), moveCard);

router.delete('/:boardId/lists/:listId', deleteList);
router.delete('/:boardId/lists/:listId/cards/:cardId', deleteCard);
router.delete('/:boardId/cards/:cardId/trash', dragDeleteCard); // for the trash icon drop

export default router;