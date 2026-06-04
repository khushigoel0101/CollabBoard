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
  socket.on('join_board', (boardId: string) => {
    if (!boardId) return;
    socket.join(boardId);
  });
  socket.on('card_moved', (data: ISocketMoveCardPayload) => {
    socket.to(data.boardId).emit('board_mutated_remote', {
      cardId: data.cardId,
      fromListId: data.fromListId,
      toListId: data.toListId,
      newIndex: data.newIndex
    });
  });
  socket.on('user_typing_focus', (data: ISocketTypingPayload) => {
    socket.to(data.boardId).emit('user_typing_focus_remote', {
      userId: data.userId,
      username: data.username
    });
  });
  socket.on('disconnect', () => {
    
  });
};