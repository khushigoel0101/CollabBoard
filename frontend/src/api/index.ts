

const BASE = import.meta.env.BACKEND_URL || 'http://localhost:5000';

const authHeader = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// ─── AUTH ────────────────────────────────────────────

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${BASE}/api/boards/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Login failed');
  }
  return res.json();
};

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await fetch(`${BASE}/api/boards/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Registration failed');
  }
  return res.json();
};

// ─── BOARDS ──────────────────────────────────────────

export const fetchBoards = async (token: string) => {
  const res = await fetch(`${BASE}/api/boards`, {
    headers: authHeader(token)
  });
  if (!res.ok) throw new Error('Failed to load boards');
  return res.json();
};

export const createBoard = async (token: string, title: string) => {
  const res = await fetch(`${BASE}/api/boards`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to create board');
  return res.json();
};

export const fetchBoardById = async (token: string, boardId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}`, {
    headers: authHeader(token)
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('Session expired. Please login again.');
    throw new Error('Failed to load board');
  }
  return res.json();
};

export const joinBoard = async (token: string, boardId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/join`, {
    method: 'POST',
    headers: authHeader(token)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to join board');
  }
  return res.json();
};

// ─── LISTS ───────────────────────────────────────────

export const createList = async (token: string, boardId: string, title: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/lists`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to create list');
  return res.json();
};

// ─── CARDS ───────────────────────────────────────────

export const createCard = async (token: string, boardId: string, listId: string, title: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/cards`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ listId, title })
  });
  if (!res.ok) throw new Error('Failed to create card');
  return res.json();
};

export const moveCard = async (
  token: string,
  boardId: string,
  cardId: string,
  fromListId: string,
  toListId: string,
  newIndex: number
) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/move-card`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ cardId, fromListId, toListId, newIndex })
  });
  if (!res.ok) throw new Error('Failed to move card');
  return res.json();
};