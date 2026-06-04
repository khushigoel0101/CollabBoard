# CollabBoard

A real-time collaborative Kanban board for teams. Build, organize, and share project workflows with live updates across connected users.

## Overview

CollabBoard is a full-stack application that combines a TypeScript React frontend with an Express backend and MongoDB persistence. It supports user authentication, board creation, task management, drag-and-drop interactions, and real-time synchronization using Socket.io.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand
- Backend: Node.js, Express, TypeScript, Socket.io, MongoDB
- Authentication: JWT / token-based auth
- Realtime: WebSockets with Socket.io

## Features

- User registration and login
- Create and manage boards, columns, and cards
- Drag-and-drop card movement between lists
- Live board updates across all connected clients
- Team invites and shared board collaboration
- Input validation and protected API routes

## Repository Structure

- `backend/` - Express API, database connection, auth, board routes, and Socket.io server
- `frontend/` - React app, UI components, pages, API client, and state management

## Local Setup

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` with:

```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Open the app

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Available Scripts

### Backend

- `npm run dev` - Start backend server in development mode
- `npm run build` - Compile backend TypeScript
- `npm start` - Run the compiled backend server

### Frontend

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build locally

## Notes

- Make sure MongoDB is running and accessible using the `MONGO_URI` value.
- Keep `JWT_SECRET` secure and do not commit `.env` files to version control.
- If using a remote backend or deployment, update `VITE_BACKEND_URL` accordingly.


