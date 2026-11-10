import { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GAP = 1000;

const isValidId = (value: unknown): value is string =>
  typeof value === 'string' && UUID_RE.test(value);

// Board is visible to its owner and its members
const boardAccess = (userId: string) => ({
  OR: [{ ownerId: userId }, { members: { some: { userId } } }],
});

const fullBoardInclude = {
  lists: {
    orderBy: { position: 'asc' as const },
    include: { cards: { orderBy: { position: 'asc' as const } } },
  },
};

// Keeps the old API shape: adds `_id` next to `id` so the frontend keeps working.
// Remove this once the frontend uses `id`.
const serializeBoard = (board: any) => ({
  ...board,
  _id: board.id,
  lists: (board.lists ?? []).map((l: any) => ({
    ...l,
    _id: l.id,
    cards: (l.cards ?? []).map((c: any) => ({ ...c, _id: c.id })),
  })),
});

const loadBoard = async (boardId: string) => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: fullBoardInclude,
  });
  return board ? serializeBoard(board) : null;
};

const hasAccess = async (boardId: string, userId: string) => {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ...boardAccess(userId) },
    select: { id: true },
  });
  return !!board;
};

export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access' });
      return;
    }

    const boards = await prisma.board.findMany({
      where: boardAccess(userId),
      select: { id: true, title: true, createdAt: true, ownerId: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(boards.map((b) => ({ ...b, _id: b.id })));
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

    const newBoard = await prisma.board.create({
      data: {
        title: title.trim(),
        ownerId: userId,
        lists: {
          create: [
            { title: 'To Do', position: GAP },
            { title: 'In Progress', position: GAP * 2 },
            { title: 'Done', position: GAP * 3 },
          ],
        },
      },
      include: fullBoardInclude,
    });

    res.status(201).json(serializeBoard(newBoard));
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

    if (!isValidId(id)) {
      res.status(400).json({ error: 'Malformed Board ID parameter' });
      return;
    }

    const board = await prisma.board.findFirst({
      where: { id, ...boardAccess(userId) },
      include: fullBoardInclude,
    });

    if (!board) {
      res.status(404).json({ error: 'Target workspace board could not be located or access is denied' });
      return;
    }

    res.status(200).json(serializeBoard(board));
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

    if (!isValidId(boardId)) {
      res.status(400).json({ error: 'Malformed Board ID parameter' });
      return;
    }

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: { not: userId } },
      select: { id: true },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found or user is already the owner' });
      return;
    }

    // Equivalent of $addToSet: no error if already a member
    await prisma.boardMember.createMany({
      data: [{ boardId, userId }],
      skipDuplicates: true,
    });

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

    if (!isValidId(boardId)) {
      res.status(400).json({ error: 'Malformed board ID parameter' });
      return;
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'List title is required' });
      return;
    }

    if (!(await hasAccess(boardId, userId))) {
      res.status(404).json({ error: 'Board not found or access denied' });
      return;
    }

    const last = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    await prisma.list.create({
      data: { boardId, title: title.trim(), position: (last?.position ?? 0) + GAP },
    });

    res.status(201).json(await loadBoard(boardId));
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

    if (!isValidId(boardId) || !isValidId(listId)) {
      res.status(400).json({ error: 'Malformed board or list ID parameter' });
      return;
    }

    if (!(await hasAccess(boardId, userId))) {
      res.status(404).json({ error: 'Board not found or access denied' });
      return;
    }

    // Cards are removed automatically (onDelete: Cascade)
    const { count } = await prisma.list.deleteMany({ where: { id: listId, boardId } });
    if (count === 0) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    res.status(200).json({ message: 'List deleted successfully', board: await loadBoard(boardId) });
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

    if (!isValidId(boardId) || !isValidId(listId)) {
      res.status(400).json({ error: 'Malformed board or list ID parameter' });
      return;
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Card title is required' });
      return;
    }

    const list = await prisma.list.findFirst({
      where: { id: listId, boardId, board: boardAccess(userId) },
      select: { id: true },
    });

    if (!list) {
      res.status(404).json({ error: 'Target workflow board or list track missing' });
      return;
    }

    const last = await prisma.card.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    await prisma.card.create({
      data: {
        listId,
        title: title.trim(),
        description: typeof description === 'string' ? description : '',
        tags: Array.isArray(tags) ? tags.map(String) : [],
        position: (last?.position ?? 0) + GAP,
      },
    });

    res.status(201).json(await loadBoard(boardId));
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

    if (!isValidId(boardId) || !isValidId(listId) || !isValidId(cardId)) {
      res.status(400).json({ error: 'Malformed board, list, or card ID parameter' });
      return;
    }

    const { count } = await prisma.card.deleteMany({
      where: {
        id: cardId,
        listId,
        list: { boardId, board: boardAccess(userId) },
      },
    });

    if (count === 0) {
      res.status(404).json({ error: 'Board, list, or card not found' });
      return;
    }

    res.status(200).json({ message: 'Card deleted successfully', board: await loadBoard(boardId) });
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

    if (!isValidId(boardId) || !isValidId(cardId) || !isValidId(fromListId)) {
      res.status(400).json({ error: 'Malformed board, list, or card ID parameter' });
      return;
    }

    const { count } = await prisma.card.deleteMany({
      where: {
        id: cardId,
        listId: fromListId,
        list: { boardId, board: boardAccess(userId) },
      },
    });

    if (count === 0) {
      res.status(404).json({ error: 'Board, list, or card not found' });
      return;
    }

    res.status(200).json({ message: 'Card trashed successfully', board: await loadBoard(boardId) });
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

    if (!isValidId(boardId) || !isValidId(fromListId) || !isValidId(toListId) || !isValidId(cardId)) {
      res.status(400).json({ error: 'Malformed identifier parameter' });
      return;
    }

    if (!(await hasAccess(boardId, userId))) {
      res.status(404).json({ error: 'Target Board space terminated or missing' });
      return;
    }

    // Both lists must belong to this board
    const lists = await prisma.list.findMany({
      where: { boardId, id: { in: [fromListId, toListId] } },
      select: { id: true },
    });
    const needed = fromListId === toListId ? 1 : 2;
    if (lists.length !== needed) {
      res.status(400).json({ error: 'Invalid workflow pipeline lists specified' });
      return;
    }

    // Destination cards without the moving card, in display order
    const destCards = await prisma.card.findMany({
      where: { listId: toListId, id: { not: cardId } },
      orderBy: { position: 'asc' },
      select: { position: true },
    });

    const cleanIndex = Math.min(Math.max(0, Number(newIndex) || 0), destCards.length);
    const prev = destCards[cleanIndex - 1]?.position;
    const next = destCards[cleanIndex]?.position;

    let position: number;
    if (prev !== undefined && next !== undefined) position = (prev + next) / 2;
    else if (prev !== undefined) position = prev + GAP;
    else if (next !== undefined) position = next - GAP;
    else position = GAP;

    // Only succeeds if the card is still in the source list
    const { count } = await prisma.card.updateMany({
      where: { id: cardId, listId: fromListId },
      data: { listId: toListId, position },
    });

    if (count === 0) {
      res.status(409).json({
        error: 'This card was already moved by someone else. Please refresh the board.',
      });
      return;
    }

    const io = req.app.get('io');
    if (io) {
      io.to(boardId).emit('board_mutated_remote', {
        cardId,
        fromListId,
        toListId,
        newIndex: cleanIndex,
      });
    }

    res.status(200).json({ message: 'State mutated and persistent', board: await loadBoard(boardId) });
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ error: 'Transactional array mutation operation crash' });
  }
};