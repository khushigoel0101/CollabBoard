import { Server, Socket } from 'socket.io';

interface ISocketMoveCardPayload {
  boardId: string;
  cardId: string;
  fromListId: string;
  toListId: string;
  newIndex: number;
}

interface ISocketTypingPayload {
  boardId: string;
  userId: string;
  username: string;
}

export const registerBoardSockets = (io: Server, socket: Socket) => {
  
  // 1. Join Project isolated network pipeline room
  socket.on('join_board', (boardId: string) => {
    if (!boardId) return;
    socket.join(boardId);
  });

  // 2. Real-time broadcast channel pipeline optimized for high-speed optimistic mutations
  socket.on('card_moved', (data: ISocketMoveCardPayload) => {
    // Relays drag drop updates instantly across all client frames in room without server query latency
    socket.to(data.boardId).emit('board_mutated_remote', {
      cardId: data.cardId,
      fromListId: data.fromListId,
      toListId: data.toListId,
      newIndex: data.newIndex
    });
  });

  // 3. User focus indicator tracing broadcast channel
  socket.on('user_typing_focus', (data: ISocketTypingPayload) => {
    socket.to(data.boardId).emit('user_typing_focus_remote', {
      userId: data.userId,
      username: data.username
    });
  });

  // 4. Handle connection release closures cleanly
  socket.on('disconnect', () => {
    // Node handles tracking session close operations out of loop cycle automatically
  });
};