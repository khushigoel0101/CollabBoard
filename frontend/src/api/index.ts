

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});

const requestOptions = (token?: string, method?: string, body?: BodyInit) => ({
  method,
  credentials: 'include' as const,
  headers: token ? authHeader(token) : { 'Content-Type': 'application/json' },
  ...(body ? { body } : {})
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
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return parseResponse(res);
};

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await fetch(`${BASE}/api/boards/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return parseResponse(res);
};

// ─── BOARDS ──────────────────────────────────────────

export const fetchBoards = async (token?: string) => {
  const res = await fetch(`${BASE}/api/boards`, {
    ...requestOptions(token),
    method: 'GET'
  });
  return parseResponse(res);
};

export const createBoard = async (token: string | undefined, title: string) => {
  const res = await fetch(`${BASE}/api/boards`, {
    ...requestOptions(token, 'POST', JSON.stringify({ title }))
  });
  return parseResponse(res);
};

export const fetchBoardById = async (token: string | undefined, boardId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}`, {
    ...requestOptions(token),
    method: 'GET'
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error('Session expired. Please login again.');
  }
  return parseResponse(res);
};

export const joinBoard = async (token: string | undefined, boardId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/join`, {
    ...requestOptions(token, 'POST')
  });
  return parseResponse(res);
};

// ─── LISTS ───────────────────────────────────────────

export const createList = async (token: string | undefined, boardId: string, title: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/lists`, {
    ...requestOptions(token, 'POST', JSON.stringify({ title }))
  });
  return parseResponse(res);
};

// ─── CARDS ───────────────────────────────────────────

export const createCard = async (token: string | undefined, boardId: string, listId: string, title: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/cards`, {
    ...requestOptions(token, 'POST', JSON.stringify({ listId, title }))
  });
  return parseResponse(res);
};

export const deleteList = async (token: string | undefined, boardId: string, listId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/lists/${listId}`, {
    ...requestOptions(token, 'DELETE')
  });
  return parseResponse(res);
};

export const deleteCard = async (token: string | undefined, boardId: string, listId: string, cardId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/lists/${listId}/cards/${cardId}`, {
    ...requestOptions(token, 'DELETE')
  });
  return parseResponse(res);
};

export const dragDeleteCard = async (token: string | undefined, boardId: string, cardId: string, fromListId: string) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/cards/${cardId}/trash`, {
    ...requestOptions(token, 'DELETE', JSON.stringify({ fromListId }))
  });
  return parseResponse(res);
};

export const moveCard = async (
  token: string | undefined,
  boardId: string,
  cardId: string,
  fromListId: string,
  toListId: string,
  newIndex: number
) => {
  const res = await fetch(`${BASE}/api/boards/${boardId}/move-card`, {
    ...requestOptions(token, 'PATCH', JSON.stringify({ cardId, fromListId, toListId, newIndex }))
  });
  return parseResponse(res);
};