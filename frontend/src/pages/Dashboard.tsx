import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import * as api from '../api/index';
import { CreateBoardModal } from '../components/CreateBoardModal';
import { Header } from '../components/Header';
import { 
  FolderGit2, 
  Calendar, 
  ChevronRight, 
  RefreshCw, 
  Layers
} from 'lucide-react';

interface BoardSummary {
  _id: string;
  title: string;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useBoardStore();
  
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 ROUTE GUARD
  useEffect(() => {
    if (!token || !user) {
      navigate('/', { replace: true });
    }
  }, [token, user, navigate]);

  // DATA FETCHING
  useEffect(() => {
    const fetchAllBoards = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await api.fetchBoards(token);
        setBoards(data);
      } catch (err: any) {
        console.error('Error loading dashboard indices', err);
        if (err?.message?.includes('Session expired') || err?.message?.includes('Unauthorized')) {
          logout();
          navigate('/', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllBoards();
  }, [token, logout, navigate]);

  if (loading || !token || !user) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900">
        <Header />
        <div className="p-12 text-center text-xs font-mono font-bold tracking-widest uppercase flex-1 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={16} className="animate-spin text-slate-900" />
          SYSTEM_SYNC_ACTIVE
        </div>
      </div>
    );
  }

 return (
  <div className="min-h-screen bg-slate-50">
    <Header />

    <main className="max-w-7xl mx-auto px-6 py-10">

      {/* HERO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Dashboard
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-2">
            Current Workspaces
          </h1>

          <p className="text-slate-500 mt-3 max-w-xl">
            Manage boards, collaborate with teammates and
            keep your projects moving forward.
          </p>
        </div>

        <div className="flex gap-3">
          <CreateBoardModal
            onSuccess={(newId) => navigate(`/board/${newId}`)}
          />

          <button
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }}
            className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-5 mb-10">

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex justify-between">
            <FolderGit2 className="text-blue-500" />
            <span className="text-xs text-slate-400">
              Total
            </span>
          </div>

          <h2 className="text-3xl font-bold mt-4">
            {boards.length}
          </h2>

          <p className="text-slate-500 mt-1">
            Boards Created
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex justify-between">
            <Layers className="text-purple-500" />
            <span className="text-xs text-slate-400">
              Active
            </span>
          </div>

          <h2 className="text-3xl font-bold mt-4">
            {boards.length}
          </h2>

          <p className="text-slate-500 mt-1">
            Projects
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex justify-between">
            <Calendar className="text-green-500" />
            <span className="text-xs text-slate-400">
              User
            </span>
          </div>

          <h2 className="text-xl font-bold mt-4 truncate">
            {user.name}
          </h2>

          <p className="text-slate-500 mt-1">
            Workspace Owner
          </p>
        </div>

      </div>

      {/* BOARDS */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Your Boards
        </h2>

        <p className="text-slate-500 mt-1">
          Open an existing board or create a new one.
        </p>
      </div>

      {boards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">

          <FolderGit2
            size={50}
            className="mx-auto text-slate-300"
          />

          <h3 className="text-xl font-semibold mt-5">
            No boards yet
          </h3>

          <p className="text-slate-500 mt-2">
            Create your first board and start collaborating.
          </p>

          <div className="mt-6">
            <CreateBoardModal
              onSuccess={(newId) =>
                navigate(`/board/${newId}`)
              }
            />
          </div>

        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board._id}
              onClick={() =>
                navigate(`/board/${board._id}`)
              }
              className="
                group
                bg-white
                rounded-2xl
                border
                border-slate-200
                p-6
                cursor-pointer
                hover:-translate-y-1
                hover:shadow-xl
                transition-all
              "
            >
              <div className="flex justify-between items-start">
                <FolderGit2
                  className="
                    text-slate-300
                    group-hover:text-blue-500
                    transition
                  "
                />

                <ChevronRight
                  className="
                    text-slate-300
                    group-hover:text-slate-900
                    transition
                  "
                />
              </div>

              <h3 className="font-semibold text-lg mt-5 text-slate-900 truncate">
                {board.title}
              </h3>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar size={14} />

                  {new Date(
                    board.createdAt
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </main>
  </div>
);
};