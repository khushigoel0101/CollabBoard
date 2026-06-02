import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import { type IBoard, type IList } from '../types/index';
import * as api from '../api/index';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

interface BoardState {
  board: IBoard | null;
  socket: Socket | null;
  isLoading: boolean;
  error: string | null;
  user: { name: string; email: string } | null;
  token: string | null;

  initStore: (boardId: string) => void;
  fetchBoard: (boardId: string) => Promise<void>;
  moveCardOptimistic: (cardId: string, fromListId: string, toListId: string, newIndex: number) => Promise<void>;
  addList: (boardId: string, title: string) => Promise<void>;
  addCard: (boardId: string, listId: string, title: string) => Promise<void>;
  createNewBoard: (title: string) => Promise<string | null>;
  disconnectStore: () => void;
  setAuth: (user: { name: string; email: string } | null, token: string | null) => void;
  logout: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  board: null,
  socket: null,
  isLoading: false,
  error: null,

  // ─── AUTH ────────────────────────────────────────────

  setAuth: (user, token) => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const activeSocket = get().socket;
    if (activeSocket) activeSocket.disconnect();
    set({ user: null, token: null, board: null, socket: null });
  },

  // ─── SOCKET ──────────────────────────────────────────

  initStore: (boardId) => {
    if (get().socket) {
      get().socket?.disconnect();
    }

    const socketInstance = io(BACKEND_URL);
    socketInstance.emit('join_board', boardId);

    socketInstance.on('board_mutated_remote', (data: {
      cardId: string;
      fromListId: string;
      toListId: string;
      newIndex: number;
    }) => {
      const currentBoard = get().board;
      if (!currentBoard) return;

      const updatedLists = JSON.parse(JSON.stringify(currentBoard.lists)) as IList[];
      const sourceList = updatedLists.find(l => l._id === data.fromListId);
      const destList = updatedLists.find(l => l._id === data.toListId);
      if (!sourceList || !destList) return;

      const cardIndex = sourceList.cards.findIndex(c => c._id === data.cardId);
      if (cardIndex === -1) return;

      const [movedCard] = sourceList.cards.splice(cardIndex, 1);
      destList.cards.splice(data.newIndex, 0, movedCard);

      set({ board: { ...currentBoard, lists: updatedLists } });
    });

    set({ socket: socketInstance });
  },

  disconnectStore: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // ─── BOARD ───────────────────────────────────────────

  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.fetchBoardById(get().token!, boardId);
      set({ board: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createNewBoard: async (title) => {
    try {
      const newBoard = await api.createBoard(get().token!, title);
      return newBoard._id;
    } catch (err) {
      console.error('Board creation failed:', err);
      return null;
    }
  },

  // ─── LISTS ───────────────────────────────────────────

  addList: async (boardId, title) => {
    try {
      const updatedBoard = await api.createList(get().token!, boardId, title);
      set({ board: updatedBoard });
    } catch (err) {
      console.error('List creation failed:', err);
    }
  },

  // ─── CARDS ───────────────────────────────────────────

  addCard: async (boardId, listId, title) => {
    try {
      const updatedBoard = await api.createCard(get().token!, boardId, listId, title);
      set({ board: updatedBoard });
    } catch (err) {
      console.error('Card creation failed:', err);
    }
  },

  moveCardOptimistic: async (cardId, fromListId, toListId, newIndex) => {
    const currentBoard = get().board;
    const socket = get().socket;
    if (!currentBoard) return;

    // Phase 1: optimistic UI update
    const updatedLists = JSON.parse(JSON.stringify(currentBoard.lists)) as IList[];
    const sourceList = updatedLists.find(l => l._id === fromListId);
    const destList = updatedLists.find(l => l._id === toListId);
    if (!sourceList || !destList) return;

    const cardIndex = sourceList.cards.findIndex(c => c._id === cardId);
    if (cardIndex === -1) return;

    const [movedCard] = sourceList.cards.splice(cardIndex, 1);
    destList.cards.splice(newIndex, 0, movedCard);
    set({ board: { ...currentBoard, lists: updatedLists } });

    // Phase 2: emit socket event
    if (socket) {
      socket.emit('card_moved', { boardId: currentBoard._id, cardId, fromListId, toListId, newIndex });
    }

    // Phase 3: persist to DB, rollback on failure
    try {
      await api.moveCard(get().token!, currentBoard._id, cardId, fromListId, toListId, newIndex);
    } catch (err) {
      console.error('Move failed, rolling back:', err);
      get().fetchBoard(currentBoard._id);
    }
  },
}));