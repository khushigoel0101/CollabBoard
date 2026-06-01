import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import { type IBoard, type IList, type ICard } from '../types/index'; // Cleaned extension for bundler compatibility

const BACKEND_URL = 'http://localhost:5000';

interface BoardState {
  board: IBoard | null;
  socket: Socket | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initStore: (boardId: string) => void;
  fetchBoard: (boardId: string) => Promise<void>;
  moveCardOptimistic: (cardId: string, fromListId: string, toListId: string, newIndex: number) => Promise<void>;
  addList: (boardId: string, title: string) => Promise<void>;
  addCard: (boardId: string, listId: string, title: string) => Promise<void>;
  createNewBoard: (title: string) => Promise<string | null>; // Re-inserted critical missing feature
  disconnectStore: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  socket: null,
  isLoading: false,
  error: null,

  initStore: (boardId) => {
    // Prevent duplicate socket connections if already active
    if (get().socket) {
      get().socket?.disconnect();
    }

    const socketInstance = io(BACKEND_URL);

    socketInstance.emit('join_board', boardId);

    // Continuous background synchronization stream listener
    socketInstance.on('board_mutated_remote', (data: { cardId: string; fromListId: string; toListId: string; newIndex: number }) => {
      const currentBoard = get().board;
      if (!currentBoard) return;

      // Fixed: Converted to a deep copy to preserve strict React 19 re-render triggers
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

  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${BACKEND_URL}/api/boards/${boardId}`);
      if (!res.ok) throw new Error('Failed to retrieve workspace data');
      const data: IBoard = await res.json();
      set({ board: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  moveCardOptimistic: async (cardId, fromListId, toListId, newIndex) => {
    const currentBoard = get().board;
    const socket = get().socket;
    if (!currentBoard) return;

    // --- PHASE 1: OPTIMISTIC UPDATE (Instant UI Change) ---
    const updatedLists = JSON.parse(JSON.stringify(currentBoard.lists)) as IList[];
    const sourceList = updatedLists.find(l => l._id === fromListId);
    const destList = updatedLists.find(l => l._id === toListId);

    if (!sourceList || !destList) return;

    const cardIndex = sourceList.cards.findIndex(c => c._id === cardId);
    if (cardIndex === -1) return;

    const [movedCard] = sourceList.cards.splice(cardIndex, 1);
    destList.cards.splice(newIndex, 0, movedCard);

    // Render updates instantly before sending any HTTP request
    set({ board: { ...currentBoard, lists: updatedLists } });

    // --- PHASE 2: NETWORKING RELAY PIPELINES ---
    if (socket) {
      socket.emit('card_moved', { boardId: currentBoard._id, cardId, fromListId, toListId, newIndex });
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/boards/${currentBoard._id}/move-card`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, fromListId, toListId, newIndex })
      });
      if (!response.ok) throw new Error('Database Sync Rejected');
    } catch (err) {
      console.error("Sync Failure. Rolling back layout engine", err);
      get().fetchBoard(currentBoard._id);
    }
  },

  addList: async (boardId, title) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/boards/${boardId}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to append list');
      const updatedBoard = await res.json();
      set({ board: updatedBoard });
    } catch (err) {
      console.error(err);
    }
  },

  addCard: async (boardId, listId, title) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/boards/${boardId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, title })
      });
      if (!res.ok) throw new Error('Failed to allocate card payload');
      const updatedBoard = await res.json();
      set({ board: updatedBoard });
    } catch (err) {
      console.error(err);
    }
  },

  createNewBoard: async (title) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to create board on server');
      
      const newBoard: IBoard = await res.json();
      set({ board: newBoard });
      return newBoard._id;
    } catch (err) {
      console.error("Board persistence failure:", err);
      return null;
    }
  },

  disconnectStore: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));