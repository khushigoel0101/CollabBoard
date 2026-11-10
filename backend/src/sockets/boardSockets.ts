import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { prisma } from '../config/db.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const boardIdSchema = z.string().regex(UUID_RE, { message: 'Invalid board ID' });

async function userCanAccessBoard(userId: string, boardId: string): Promise<boolean> {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
  return !!board;
}

export const registerBoardSockets = (io: Server, socket: Socket) => {
  const userId: string = socket.data.userId;
  const email: string = socket.data.email;
  const joinedBoards: Set<string> = socket.data.joinedBoards;

  socket.on('join_board', async (rawBoardId: unknown) => {
    const parsed = boardIdSchema.safeParse(rawBoardId);
    if (!parsed.success) {
      socket.emit('error', { message: 'Invalid board ID' });
      return;
    }
    const boardId = parsed.data;

    try {
      const authorized = await userCanAccessBoard(userId, boardId);
      if (!authorized) {
        socket.emit('error', { message: 'Not authorized to join this board' });
        return;
      }

      joinedBoards.add(boardId);
      socket.join(boardId);
    } catch (error) {
      console.error('Join board socket error:', error);
      socket.emit('error', { message: 'Failed to join board' });
    }
  });

  socket.on('user_typing_focus', (rawBoardId: unknown) => {
    const parsed = boardIdSchema.safeParse(rawBoardId);
    if (!parsed.success) return;
    const boardId = parsed.data;

    if (!joinedBoards.has(boardId)) return;

    socket.to(boardId).emit('user_typing_focus_remote', { userId, email });
  });

  socket.on('disconnect', () => {
    joinedBoards.clear();
  });
};