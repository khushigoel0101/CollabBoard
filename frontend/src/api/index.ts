

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});

const parseResponse = async (res: Response) => {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || res.statusText || 'API request failed');
  }
  return payload;
};

// ─── AUTH ────────────────────────────────────────────

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${BASE}/api/boards/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return parseResponse(res);
};

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await fetch(`${BASE}/api/boards/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return parseResponse(res);
};

// ─── BOARDS ──────────────────────────────────────────

export const fetchBoards = async (token: string) => {
  const res = await fetch(`${BASE}/api/boards`, {
    headers: authHeader(token)
  });
  return parseResponse(res);
};

export const createBoard = async (token: string, title: string) => {
  const res = await fetch(`${BASE}/api/boards`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ title })
  });
  return parseResponse(res);
};

export const fetchBoardById = async (token: string, boardId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}`, {
    headers: authHeader(token)
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error('Session expired. Please login again.');
  }
  return parseResponse(res);
};

export const joinBoard = async (token: string, boardId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/join`, {
    method: 'POST',
    headers: authHeader(token)
  });
  return parseResponse(res);
};

// ─── LISTS ───────────────────────────────────────────

export const createList = async (token: string, boardId: string, title: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/lists`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ title })
  });
  return parseResponse(res);
};

// ─── CARDS ───────────────────────────────────────────

export const createCard = async (token: string, boardId: string, listId: string, title: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/cards`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ listId, title })
  });
  return parseResponse(res);
};

export const deleteList = async (token: string, boardId: string, listId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/lists/${listId}`, {
    method: 'DELETE',
    headers: authHeader(token)
  });
  return parseResponse(res);
};

export const deleteCard = async (token: string, boardId: string, listId: string, cardId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/lists/${listId}/cards/${cardId}`, {
    method: 'DELETE',
    headers: authHeader(token)
  });
  return parseResponse(res);
};

export const dragDeleteCard = async (token: string, boardId: string, cardId: string, fromListId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/cards/${cardId}/trash`, {
    method: 'DELETE',
    headers: authHeader(token),
    body: JSON.stringify({ fromListId })
  });
  return parseResponse(res);
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
  return parseResponse(res);
};