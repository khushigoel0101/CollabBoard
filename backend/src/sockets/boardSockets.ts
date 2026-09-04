import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Board } from '../models/Board.js';

const boardIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid board ID',
});

async function userCanAccessBoard(userId: string, boardId: string): Promise<boolean> {
  const board = await Board.findOne({
    _id: boardId,
    $or: [{ ownerId: userId }, { members: userId }],
  }).select('_id');
  return !!board;
}

export const registerBoardSockets = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;
  const email = socket.data.email;
  const joinedBoards: Set<string> = socket.data.joinedBoards;

  socket.on('join_board', async (rawBoardId: unknown) => {
    const parsed = boardIdSchema.safeParse(rawBoardId);
    if (!parsed.success) {
      socket.emit('error', { message: 'Invalid board ID' });
      return;
    }
    const boardId = parsed.data;

    const authorized = await userCanAccessBoard(userId, boardId);
    if (!authorized) {
      socket.emit('error', { message: 'Not authorized to join this board' });
      return;
    }

    joinedBoards.add(boardId);
    socket.join(boardId);
  });

  socket.on('user_typing_focus', (rawBoardId: unknown) => {
    const parsed = boardIdSchema.safeParse(rawBoardId);
    if (!parsed.success) return;
    const boardId = parsed.data;

    if (!joinedBoards.has(boardId)) return;

    socket.to(boardId).emit('user_typing_focus_remote', {
      userId,
      email,
    });
  });

  socket.on('disconnect', () => {
    joinedBoards.clear();
  });
};