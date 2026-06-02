# CollabBoard

A real-time collaborative Kanban board for teams. Create boards, manage tasks, and invite teammates — all synced live via WebSockets.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Zustand, Socket.io Client
- **Backend:** Node.js, Express, MongoDB, Socket.io, JWT

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:
```env
VITE_BACKEND_URL=http://localhost:5000
```

## Features

- JWT authentication (register / login)
- Create boards, lists, and task cards
- Drag and drop cards with optimistic UI
- Invite teammates via shareable links
- Live sync across all clients via WebSockets
