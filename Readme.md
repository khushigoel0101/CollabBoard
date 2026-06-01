# CollabBoard Engine 🚀

A real-time, event-driven collaborative Kanban workspace built on a modern MERN stack with strict TypeScript typing, state management via Zustand, and reactive zero-latency live sync driven by WebSockets.

---

## 🛠️ System Architecture & Workflow

The platform utilizes a modern real-time synchronization pipeline to allow multi-user collaboration with minimal database strain.

* **Dynamic Subdocument Routing:** Each workspace operates on a dynamic URL schema using its native MongoDB `_id` identifier. 
* **Optimistic UI Updates:** Drag-and-drop structural updates render instantly on the client layout via Zustand state mutations before executing background HTTP REST operations.
* **WebSocket Isolation:** Live collaborators are dynamically partitioned into virtual Socket.io "Rooms" matching their targeted Board IDs, preventing cross-workspace event leaking.

---

## 🏗️ Tech Stack

### Frontend (`/frontend`)
- **React 19** & **TypeScript**
- **Vite** (Build Framework & Bundler Resolution)
- **Zustand** (Strict Atomic Global State Engine)
- **Socket.io-Client** (Persistent duplex network relay streaming)
- **Tailwind CSS** (Utility-first styling platform)
- **Lucide React** (Vector iconography)
- **React Router DOM** (Dynamic address-bar parameter matching)

### Backend (`/backend`)
- **Node.js** & **Express** (Runtime & API layer)
- **Mongoose / MongoDB Atlas** (NoSQL Document Store & Subdocument Arrays)
- **Socket.io Server** (Event emission broadcasting room matrix)
- **Zod** (Runtime type safety and request body payload validation)

---

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org/) (v18+) and a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster ready.

### 1. Clone & Core Configuration
Initialize your environment variables. Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://kgoel286_db_user:EHyc4zR1iyccVldg@cluster0.xbty7b6.mongodb.net/