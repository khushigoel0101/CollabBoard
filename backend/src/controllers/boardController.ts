import { Request, Response } from 'express';
import { Board } from '../models/Board.js'; 
import { MoveCardSchema, CreateCardSchema, CreateListSchema } from '../config/validation.js';
import mongoose from 'mongoose';
import { z } from 'zod';

// Input Validator Schema for Board Creation
const CreateBoardSchema = z.object({
  title: z.string().min(1, 'Board title cannot be empty').max(50, 'Title too long')
});

// Helper utility to standardize Zod error formatting
const handleZodError = (res: Response, error: unknown): boolean => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ 
      error: 'Validation Failed', 
      details: error.issues.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
    return true;
  }
  return false;
};

// ==========================================
// 1. CREATE BOARD CONTROLLER
// ==========================================
export const createBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse the incoming body against the Zod schema
    const validatedBody = CreateBoardSchema.parse(req.body);

    // Initialize the new board layout with default standard columns
    const newBoard = new Board({
      title: validatedBody.title,
      lists: [
        { _id: new mongoose.Types.ObjectId().toString(), title: 'To Do', cards: [] },
        { _id: new mongoose.Types.ObjectId().toString(), title: 'In Progress', cards: [] },
        { _id: new mongoose.Types.ObjectId().toString(), title: 'Done', cards: [] }
      ]
    });

    // Write directly to your MongoDB cluster
    await newBoard.save();
    
    // Return the newly created board document (including its generated _id) to the client
    res.status(201).json(newBoard);
  } catch (error) {
    if (handleZodError(res, error)) return;
    res.status(500).json({ error: 'Failed to safely instantiate new workspace board' });
  }
};

// ==========================================
// 2. FETCH ALL BOARDS (FOR DASHBOARD VIEW)
// ==========================================
export const getBoards = async (req: Request, res: Response): Promise<void> => {
  try {
    const boards = await Board.find({}, '_id title createdAt');
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error loading dashboard workspace' });
  }
};

// ==========================================
// 3. FETCH SINGLE BOARD BY ID
// ==========================================

export const getBoardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Type Guard: Enforce that 'id' must be a single string string and not an array
    if (typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid or malformed URL route identifier mapping' });
      return;
    }

    // Now TypeScript safely knows 'id' is strictly a string primitive
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Malformed Board Identifier' });
      return;
    }

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({ error: 'Target workspace board could not be located' });
      return;
    }
    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Database Exception' });
  }
};

// ==========================================
// 4. CREATE KANBAN LIST
// ==========================================
export const createList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const validatedBody = CreateListSchema.parse(req.body);

    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    board.lists.push({
      _id: new mongoose.Types.ObjectId().toString(),
      title: validatedBody.title,
      cards: []
    } as any);

    await board.save();
    res.status(201).json(board);
  } catch (error) {
    if (handleZodError(res, error)) return;
    res.status(500).json({ error: 'Failed to safely register list payload' });
  }
};

// ==========================================
// 5. CREATE TASK CARD
// ==========================================
export const createCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const validatedBody = CreateCardSchema.parse(req.body);

    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404).json({ error: 'Target workflow workspace missing' });
      return;
    }

    const targetList = board.lists.find(list => list._id.toString() === validatedBody.listId);
    if (!targetList) {
      res.status(404).json({ error: 'Target insertion array structural block missing' });
      return;
    }

    targetList.cards.push({
      _id: new mongoose.Types.ObjectId().toString(),
      title: validatedBody.title,
      description: validatedBody.description || '',
      tags: validatedBody.tags || []
    } as any);

    await board.save();
    res.status(201).json(board);
  } catch (error) {
    if (handleZodError(res, error)) return;
    res.status(500).json({ error: 'Could not write card schema entity' });
  }
};

// ==========================================
// 6. DRAG AND DROP REORDER/MOVE ALGORITHM
// ==========================================
export const moveCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const validatedPayload = MoveCardSchema.parse(req.body);
    const { cardId, fromListId, toListId, newIndex } = validatedPayload;

    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404).json({ error: 'Target Board space terminated or missing' });
      return;
    }

    const sourceList = board.lists.find(l => l._id.toString() === fromListId);
    const destList = board.lists.find(l => l._id.toString() === toListId);

    if (!sourceList || !destList) {
      res.status(400).json({ error: 'Invalid workflow pipeline lists specified' });
      return;
    }

    const cardIndex = sourceList.cards.findIndex(c => c._id.toString() === cardId);
    if (cardIndex === -1) {
      res.status(400).json({ error: 'Card data not found in source origin list track' });
      return;
    }

    const [movedCard] = sourceList.cards.splice(cardIndex, 1);
    const cleanIndex = Math.min(Math.max(0, newIndex), destList.cards.length);
    destList.cards.splice(cleanIndex, 0, movedCard as any);

    board.markModified('lists');

    await board.save();
    res.status(200).json({ message: 'State mutated and persistent', board });
  } catch (error) {
    if (handleZodError(res, error)) return;
    res.status(500).json({ error: 'Transactional array mutation operation crash' });
  }
};