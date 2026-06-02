import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import { Column } from './Column';
import { Header } from './Header';
import { Kanban, Plus, ArrowLeft, Share2, Check, ShieldAlert } from 'lucide-react';

export const Board: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { board, fetchBoard, initStore, disconnectStore, addList, isLoading, error, token } = useBoardStore();
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!boardId || !token) return;
    initStore(boardId);
    fetchBoard(boardId);
    return () => disconnectStore();
  }, [boardId, token, initStore, fetchBoard, disconnectStore]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !board) return;
    await addList(board._id, newListTitle.trim());
    setNewListTitle('');
    setIsCreatingList(false);
  };

  const handleCopyInvite = () => {
    if (!board) return;
    const inviteUrl = `${window.location.origin}/invite/${board._id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-purple-50 text-slate-800 flex flex-col font-sans antialiased">
        <Header />
        <div className="text-center p-12 max-w-sm mx-auto my-auto bg-white rounded-2xl border border-red-100 shadow-sm">
          <ShieldAlert className="text-red-500 mx-auto mb-3" size={32} />
          <h3 className="font-bold text-slate-800 mb-1">Access Denied</h3>
          <p className="text-xs text-slate-500 mb-4">You must be securely logged in to read or evaluate workspace channels.</p>
          <button onClick={() => navigate('/')} className="text-xs font-semibold bg-slate-800 px-4 py-2 rounded-xl text-white cursor-pointer">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-purple-50 text-slate-800 flex flex-col font-sans antialiased">
        <Header />
        <div className="text-purple-700 p-8 text-center text-sm font-medium flex-1 flex items-center justify-center tracking-wide">
          Synchronizing Real-Time Workspace Layers...
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-purple-50 text-slate-800 flex flex-col font-sans antialiased">
        <Header />
        <div className="text-center p-12 max-w-sm mx-auto my-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-red-600 mb-4 font-mono text-xs font-semibold">Workspace Handshake Fault: {error || 'Missing Object'}</p>
          <button onClick={() => navigate('/')} className="text-xs bg-purple-700 px-4 py-2 rounded-xl text-white cursor-pointer hover:bg-purple-800">Back to Hub</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 text-slate-800 flex flex-col font-sans antialiased overflow-hidden">
      <Header />

      {/* Sub-Header Actions Deck */}
      <div className="px-8 py-3 bg-white/90 backdrop-blur-md border-b border-purple-100 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-slate-800 transition-colors p-1 hover:bg-slate-50 rounded-lg flex items-center gap-1 text-xs font-semibold pr-2 cursor-pointer"
          >
            <ArrowLeft size={14} /> Dash
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Kanban size={16} className="text-purple-600" />
            <h2 className="text-sm font-bold tracking-wide text-purple-900">{board.title}</h2>
          </div>
        </div>

        <button
          onClick={handleCopyInvite}
          className="bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
        >
          {copied ? <Check size={14} className="text-purple-600 animate-scale-up" /> : <Share2 size={14} />}
          {copied ? 'Invite Link Copied!' : 'Invite Teammate'}
        </button>
      </div>

      {/* Kanban Board Scroll Area */}
      <div className="flex-1 p-8 overflow-x-auto flex gap-6 items-start custom-scrollbar">
        {board.lists.map((list) => (
          <Column key={list._id} list={list} boardId={board._id} />
        ))}

        <div className="w-72 shrink-0">
          {isCreatingList ? (
            <form onSubmit={handleCreateList} className="bg-white border border-purple-100 p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
              <input
                autoFocus
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Pipeline Phase Title..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-purple-600 transition-colors"
              />
              <div className="flex gap-2 justify-end mt-1">
                <button type="button" onClick={() => setIsCreatingList(false)} className="text-slate-500 hover:text-slate-800 text-xs cursor-pointer px-2">
                  Cancel
                </button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                  Add List
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingList(true)}
              className="w-full bg-white/50 hover:bg-white border border-dashed border-purple-300 text-purple-800 hover:text-purple-600 font-semibold text-xs py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus size={14} /> Append Progress Pipeline
            </button>
          )}
        </div>
      </div>
    </div>
  );
};