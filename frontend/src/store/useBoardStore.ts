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
  actionError: string | null;
  user: { name: string; email: string } | null;
  token: string | null;

  initStore: (boardId: string) => void;
  fetchBoard: (boardId: string) => Promise<void>;
  moveCardOptimistic: (cardId: string, fromListId: string, toListId: string, newIndex: number) => Promise<void>;
  addList: (boardId: string, title: string) => Promise<void>;
  deleteList: (boardId: string, listId: string) => Promise<void>;
  addCard: (boardId: string, listId: string, title: string) => Promise<void>;
  deleteCard: (boardId: string, listId: string, cardId: string) => Promise<void>;
  dragDeleteCard: (boardId: string, cardId: string, fromListId: string) => Promise<void>;
  createNewBoard: (title: string) => Promise<string | null>;
  disconnectStore: () => void;
  setAuth: (user: { name: string; email: string } | null, token: string | null) => void;
  logout: () => void;
}

const safeParseUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const decodeJwtPayload = (token: string | null) => {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const getValidSession = () => {
  const user = safeParseUser();

  if (!user) {
    clearAuthStorage();
    return { user: null, token: null };
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return { user, token: null };
  }

  const payload = decodeJwtPayload(token);
  const isExpired = payload?.exp ? payload.exp * 1000 <= Date.now() : false;

  if (isExpired) {
    clearAuthStorage();
    return { user: null, token: null };
  }

  return { user, token };
};

export const useBoardStore = create<BoardState>((set, get) => {
  const persistedSession = getValidSession();

  return {
    user: persistedSession.user,
    token: persistedSession.token,
    board: null,
    socket: null,
    isLoading: false,
    error: null,
    actionError: null,

    // ─── AUTH ────────────────────────────────────────────

    setAuth: (user, token) => {
      if (!user) {
        clearAuthStorage();
        set({ user: null, token: null });
        return;
      }

      if (token) {
        const payload = decodeJwtPayload(token);
        const isExpired = payload?.exp ? payload.exp * 1000 <= Date.now() : false;

        if (isExpired) {
          clearAuthStorage();
          set({ user: null, token: null });
          return;
        }

        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }

      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token });
    },

    logout: () => {
      clearAuthStorage();
      const activeSocket = get().socket;
      if (activeSocket) activeSocket.disconnect();
      set({ user: null, token: null, board: null, socket: null });
    },

    // ─── SOCKET ──────────────────────────────────────────

    initStore: (boardId) => {
      if (get().socket) {
        get().socket?.disconnect();
      }

      const socketInstance = io(BACKEND_URL, {
        withCredentials: true,
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection failed:', err.message);
      });

      socketInstance.on('connect', () => {
        socketInstance.emit('join_board', boardId);
      });

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

    // Optimistic: remove list from UI immediately, rollback on failure
    deleteList: async (boardId, listId) => {
      const currentBoard = get().board;
      if (!currentBoard) return;

      const optimisticLists = currentBoard.lists.filter(l => l._id !== listId);
      set({ board: { ...currentBoard, lists: optimisticLists } });

      try {
        await api.deleteList(get().token!, boardId, listId);
      } catch (err) {
        console.error('Delete list failed, rolling back:', err);
        set({ board: currentBoard });
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

    // Optimistic: remove card from UI immediately, rollback on failure
    deleteCard: async (boardId, listId, cardId) => {
      const currentBoard = get().board;
      if (!currentBoard) return;

      const optimisticLists = currentBoard.lists.map(l =>
        l._id === listId
          ? { ...l, cards: l.cards.filter(c => c._id !== cardId) }
          : l
      );
      set({ board: { ...currentBoard, lists: optimisticLists } });

      try {
        await api.deleteCard(get().token!, boardId, listId, cardId);
      } catch (err) {
        console.error('Delete card failed, rolling back:', err);
        set({ board: currentBoard });
      }
    },

    // Used by drag-to-trash — same optimistic logic, different API endpoint
    dragDeleteCard: async (boardId, cardId, fromListId) => {
      const currentBoard = get().board;
      if (!currentBoard) return;

      const optimisticLists = currentBoard.lists.map(l =>
        l._id === fromListId
          ? { ...l, cards: l.cards.filter(c => c._id !== cardId) }
          : l
      );
      set({ board: { ...currentBoard, lists: optimisticLists } });

      try {
        await api.dragDeleteCard(get().token!, boardId, cardId, fromListId);
      } catch (err) {
        console.error('Drag-delete card failed, rolling back:', err);
        set({ board: currentBoard });
      }
    },

    moveCardOptimistic: async (cardId, fromListId, toListId, newIndex) => {
      const currentBoard = get().board;
      if (!currentBoard) return;

      const updatedLists = JSON.parse(JSON.stringify(currentBoard.lists)) as IList[];
      const sourceList = updatedLists.find(l => l._id === fromListId);
      const destList = updatedLists.find(l => l._id === toListId);
      if (!sourceList || !destList) return;

      const cardIndex = sourceList.cards.findIndex(c => c._id === cardId);
      if (cardIndex === -1) return;

      const [movedCard] = sourceList.cards.splice(cardIndex, 1);
      destList.cards.splice(newIndex, 0, movedCard);
      set({ board: { ...currentBoard, lists: updatedLists } });

      try {
        await api.moveCard(get().token!, currentBoard._id, cardId, fromListId, toListId, newIndex);
      } catch (err: any) {
        const status = err?.response?.status;
        const message = status === 409 ? 'This card was updated by someone else. Refreshing the board...' : 'Move failed, refreshing the board.';
        console.error('Move failed, rolling back:', err);
        set({ actionError: message });
        get().fetchBoard(currentBoard._id);
      }
    }
  };
});