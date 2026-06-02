import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import { CreateBoardModal } from './CreateBoardModal';
import { Header } from './Header';
import { AuthModal } from './AuthModal';
import { Leaf, CheckCircle2, Users, Layers, Calendar, ChevronRight, LogOut, User } from 'lucide-react';

import { prod } from '../assets/index';

interface BoardSummary {
  _id: string;
  title: string;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const { user, token, logout } = useBoardStore();

  useEffect(() => {
    const fetchAllBoards = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch('http://localhost:5000/api/boards', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBoards(data);
        } else if (res.status === 401 || res.status === 403) {
          logout();
        }
      } catch (err) {
        console.error("Error loading dashboard indices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBoards();
  }, [token, logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex flex-col font-sans antialiased">
        <Header />
        <div className="text-purple-700 p-12 text-center text-sm font-medium tracking-wide flex-1 flex items-center justify-center">
          Synchronizing User Workspace Catalog...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 text-slate-800 flex flex-col font-sans antialiased">
      <Header />

      {/* Hero Section Banner */}
      <section className="px-8 pt-10 pb-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-md border border-purple-100 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={prod}
              alt="Collaboration"
              className="w-full md:w-[220px] h-[140px] rounded-2xl object-cover shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Leaf size={16} />
                <span className="font-medium text-xs tracking-wide uppercase">Organize • Collaborate • Deliver</span>
              </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-2">Manage Projects Beautifully</h2>
              <p className="text-slate-600 text-sm max-w-xl mb-4">
                Create architectural pipelines, track real-time changes, and integrate instantly with distributed team channels.
              </p>
              <div className="flex gap-4 text-xs text-purple-700 font-semibold">
                <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                  <CheckCircle2 size={14} className="text-purple-600" />
                  Real-Time Engine Sync
                </div>
                <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                  <Users size={14} className="text-purple-600" />
                  Room-Based Sockets
                </div>
              </div>
            </div>
          </div>

          {/* Auth Box */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl shrink-0 w-full md:w-64 flex flex-col gap-3 justify-center">
            {user ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-center text-purple-700 font-bold text-xs uppercase">
                    {user.name.slice(0, 2)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 leading-none truncate">{user.name}</p>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={12} /> Sign Out Session
                </button>
              </>
            ) : (
              <div className="text-center p-1">
                <p className="text-xs text-slate-500 font-medium mb-3">Sign in to check or track changes across active dashboards.</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Access / Account Setup
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Boards Grid */}
      <div className="max-w-6xl mx-auto w-full px-8 py-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-purple-900">Your Shared Workspaces</h3>
            <p className="text-xs text-slate-500">Select an operational team track or spin up a new document repository hub.</p>
          </div>
          {user && <CreateBoardModal onSuccess={(newId) => navigate(`/board/${newId}`)} />}
        </div>

        {!user ? (
          <div className="flex-1 border border-dashed border-purple-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto my-8 bg-white/60 shadow-xs">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-purple-600 mb-3">
              <User size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Authorization Required</h4>
            <p className="text-xs text-slate-500 mb-4">Please log in to register workspaces or load existing tracking boards on your profile.</p>
            <button onClick={() => setShowAuthModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs px-4 py-2 rounded-xl cursor-pointer">
              Login or Sign Up
            </button>
          </div>
        ) : boards.length === 0 ? (
          <div className="flex-1 border border-dashed border-purple-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto my-8 bg-white/60 shadow-xs">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-purple-600 mb-3">
              <Layers size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">No Workspaces Found</h4>
            <p className="text-xs text-slate-500 mb-1">Your document cluster is empty.</p>
            <p className="text-[11px] text-slate-400">Click the button above to initialize your first tracker.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((b) => (
              <div
                key={b._id}
                onClick={() => navigate(`/board/${b._id}`)}
                className="bg-white border border-slate-100 hover:border-purple-300 p-5 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between h-36 relative overflow-hidden shadow-xs hover:shadow-md"
              >
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors truncate pr-6">{b.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block mt-1">ID: {b._id}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Created {new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
                <ChevronRight size={16} className="absolute bottom-5 right-5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};