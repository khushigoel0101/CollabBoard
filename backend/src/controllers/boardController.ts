import { Request, Response } from 'express';
import { Board } from '../models/Board.js';
import mongoose, { Types } from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware.js';

const isValidObjectId = (value: unknown): value is string => {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
};

const boardAccessFilter = (boardId: string, userId: string) => ({
  _id: new Types.ObjectId(boardId),
  $or: [
    { ownerId: new Types.ObjectId(userId) },
    { members: new Types.ObjectId(userId) }
  ]
});

export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    const boards = await Board.find(
      {
        $or: [
          { ownerId: new Types.ObjectId(userId) },
          { members: new Types.ObjectId(userId) }
        ]
      },
      '_id title createdAt ownerId'
    );

    res.status(200).json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Error loading workspace boards' });
  }
};

export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Board title is required' });
      return;
    }

    const newBoard = new Board({
      title: title.trim(),
      ownerId: new Types.ObjectId(userId),
      members: [],
      lists: [
        { title: 'To Do', cards: [] },
        { title: 'In Progress', cards: [] },
        { title: 'Done', cards: [] }
      ]
    });

    await newBoard.save();
    res.status(201).json(newBoard);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board configuration' });
  }
};

export const getBoardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({ error: 'Malformed Board ID parameter' });
      return;
    }

    const board = await Board.findOne(boardAccessFilter(id, userId));
    if (!board) {
      res.status(404).json({ error: 'Target workspace board could not be located or access is denied' });
      return;
    }

    res.status(200).json(board);
  } catch (error) {
    console.error('Get board by id error:', error);
    res.status(500).json({ error: 'Internal Server Database Exception' });
  }
};

export const joinBoardTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: boardId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context missing' });
      return;
    }

    if (!isValidObjectId(boardId)) {
      res.status(400).json({ error: 'Malformed Board ID parameter' });
      return;
    }

    const board = await Board.findOneAndUpdate(
      {
        _id: new Types.ObjectId(boardId),
        ownerId: { $ne: new Types.ObjectId(userId) }
      },
      { $addToSet: { members: new Types.ObjectId(userId) } },
      { new: true }
    );

    if (!board) {
      res.status(404).json({ error: 'Board not found or user is already the owner' });
      return;
    }

    res.status(200).json({ message: 'Successfully joined board workspace team', boardId });
  } catch (err) {
    console.error('Join board error:', err);
    res.status(500).json({ error: 'Failed to join the board team' });
  }
};

export const createList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    if (!isValidObjectId(boardId)) {
      res.status(400).json({ error: 'Malformed board ID parameter' });
      return;
    }

    const updatedBoard = await Board.findOneAndUpdate(
      boardAccessFilter(boardId, userId),
      { $push: { lists: { title: title.trim(), cards: [] } } },
      { new: true }
    );

    if (!updatedBoard) {
      res.status(404).json({ error: 'Board not found or access denied' });
      return;
    }

    res.status(201).json(updatedBoard);
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to safely register list payload' });
  }
};

// DELETE /boards/:boardId/lists/:listId
export const deleteList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId, listId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    if (!isValidObjectId(boardId) || !isValidObjectId(listId)) {
      res.status(400).json({ error: 'Malformed board or list ID parameter' });
      return;
    }

    const updatedBoard = await Board.findOneAndUpdate(
      boardAccessFilter(boardId, userId),
      { $pull: { lists: { _id: new Types.ObjectId(listId) } } },
      { new: true }
    );

    if (!updatedBoard) {
      res.status(404).json({ error: 'Board not found or access denied' });
      return;
    }

    res.status(200).json({ message: 'List deleted successfully', board: updatedBoard });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
};

export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { listId, title, description, tags } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    if (!isValidObjectId(boardId) || !isValidObjectId(listId)) {
      res.status(400).json({ error: 'Malformed board or list ID parameter' });
      return;
    }

    const updatedBoard = await Board.findOneAndUpdate(
      {
        ...boardAccessFilter(boardId, userId),
        'lists._id': new Types.ObjectId(listId)
      },
      {
        $push: {
          'lists.$.cards': {
            title: title.trim(),
            description: description || '',
            tags: tags || []
          }
        }
      },
      { new: true }
    );

    if (!updatedBoard) {
      res.status(404).json({ error: 'Target workflow board or list track missing' });
      return;
    }

    res.status(201).json(updatedBoard);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Could not write card schema entity' });
  }
};

// DELETE /boards/:boardId/lists/:listId/cards/:cardId
export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId, listId, cardId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    if (!isValidObjectId(boardId) || !isValidObjectId(listId) || !isValidObjectId(cardId)) {
      res.status(400).json({ error: 'Malformed board, list, or card ID parameter' });
      return;
    }

    const updatedBoard = await Board.findOneAndUpdate(
      {
        ...boardAccessFilter(boardId, userId),
        'lists._id': new Types.ObjectId(listId)
      },
      {
        $pull: {
          'lists.$.cards': { _id: new Types.ObjectId(cardId) }
        }
      },
      { new: true }
    );

    if (!updatedBoard) {
      res.status(404).json({ error: 'Board, list, or card not found' });
      return;
    }

    res.status(200).json({ message: 'Card deleted successfully', board: updatedBoard });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};

// DELETE /boards/:boardId/cards/:cardId/trash  — used by drag-to-trash on the frontend
// Body: { fromListId }
export const dragDeleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId, cardId } = req.params;
    const { fromListId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    if (
      !isValidObjectId(boardId) ||
      !isValidObjectId(cardId) ||
      !isValidObjectId(fromListId)
    ) {
      res.status(400).json({ error: 'Malformed board, list, or card ID parameter' });
      return;
    }

    const updatedBoard = await Board.findOneAndUpdate(
      {
        ...boardAccessFilter(boardId, userId),
        'lists._id': new Types.ObjectId(fromListId)
      },
      {
        $pull: {
          'lists.$.cards': { _id: new Types.ObjectId(cardId) }
        }
      },
      { new: true }
    );

    if (!updatedBoard) {
      res.status(404).json({ error: 'Board, list, or card not found' });
      return;
    }

    res.status(200).json({ message: 'Card trashed successfully', board: updatedBoard });
  } catch (error) {
    console.error('Drag delete card error:', error);
    res.status(500).json({ error: 'Failed to trash card' });
  }
};

export const moveCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { cardId, fromListId, toListId, newIndex } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    if (!isValidObjectId(boardId) || !isValidObjectId(fromListId) || !isValidObjectId(toListId) || !isValidObjectId(cardId)) {
      res.status(400).json({ error: 'Malformed identifier parameter' });
      return;
    }

    const board = await Board.findOne(boardAccessFilter(boardId, userId));
    if (!board) {
      res.status(404).json({ error: 'Target Board space terminated or missing' });
      return;
    }

    const sourceList = board.lists.find((l) => l._id.toString() === fromListId);
    const destList = board.lists.find((l) => l._id.toString() === toListId);

    if (!sourceList || !destList) {
      res.status(400).json({ error: 'Invalid workflow pipeline lists specified' });
      return;
    }

    const cardIndex = sourceList.cards.findIndex((c) => c._id.toString() === cardId);
    if (cardIndex === -1) {
      res.status(400).json({ error: 'Card data not found in source origin list track' });
      return;
    }

    const [movedCard] = sourceList.cards.splice(cardIndex, 1);
    const cleanIndex = Math.min(Math.max(0, newIndex), destList.cards.length);
    destList.cards.splice(cleanIndex, 0, movedCard);

    board.markModified('lists');
    await board.save();

    res.status(200).json({ message: 'State mutated and persistent', board });
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ error: 'Transactional array mutation operation crash' });
  }
};