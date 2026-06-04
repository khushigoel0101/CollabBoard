import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import { Column } from './Column';
import { Header } from './Header';
import { Plus, ArrowLeft, Share2, Check, ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';

export const Board: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { board, fetchBoard, initStore, disconnectStore, addList, isLoading, error, token, dragDeleteCard } = useBoardStore();
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [copied, setCopied] = useState(false);

  // Track whether any card is being dragged (to show trash zones)
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  // Global floating trash zone state
  const [isGlobalTrashHovered, setIsGlobalTrashHovered] = useState(false);

  useEffect(() => {
    if (!boardId || !token) return;
    initStore(boardId);
    fetchBoard(boardId);
    return () => disconnectStore();
  }, [boardId, token, initStore, fetchBoard, disconnectStore]);

  // Global drag listeners to show/hide trash zones across the whole board
  useEffect(() => {
    const onDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement)?.dataset?.cardid) {
        setIsDraggingCard(true);
      }
    };
    const onDragEnd = () => {
      setIsDraggingCard(false);
      setIsGlobalTrashHovered(false);
    };
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragend', onDragEnd);
    return () => {
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('dragend', onDragEnd);
    };
  }, []);

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

  // Global floating trash zone handlers
  const handleGlobalTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalTrashHovered(true);
  };

  const handleGlobalTrashDragLeave = () => {
    setIsGlobalTrashHovered(false);
  };

  const handleGlobalTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalTrashHovered(false);
    setIsDraggingCard(false);
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData || !board) return;
    const { cardId, fromListId } = JSON.parse(rawData);
    dragDeleteCard(board._id, cardId, fromListId);
  };

  // 🔒 ACCESS DENIED STATE
  if (!token) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
        <Header />
        <div className="text-center p-8 max-w-sm mx-auto my-auto bg-white rounded-md border border-slate-200 shadow-sm">
          <ShieldAlert className="text-slate-900 mx-auto mb-3" size={28} />
          <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-900 mb-1">Access Denied</h3>
          <p className="text-xs text-slate-500 mb-4">You must be securely logged in to read or evaluate workspace channels.</p>
          <button onClick={() => navigate('/')} className="text-xs font-bold bg-slate-900 hover:bg-slate-950 px-4 py-2 rounded-md text-white cursor-pointer transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 🔄 LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
        <Header />
        <div className="p-12 text-center text-xs font-mono font-bold tracking-widest uppercase flex-1 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={16} className="animate-spin text-slate-900" />
          BOARD_SYNC_ACTIVE
        </div>
      </div>
    );
  }

  // ❌ ERROR STATE
  if (error || !board) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
        <Header />
        <div className="text-center p-8 max-w-sm mx-auto my-auto bg-white rounded-md border border-slate-200 shadow-sm">
          <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-red-600 mb-2">Workspace Fault</h3>
          <p className="text-xs text-slate-500 font-mono mb-4 bg-slate-50 p-2 rounded border border-slate-200 break-all">
            {error || 'MISSING_BOARD_OBJECT'}
          </p>
          <button onClick={() => navigate('/')} className="text-xs font-bold bg-slate-950 px-4 py-2 rounded-md text-white cursor-pointer hover:bg-slate-900 transition-colors">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased overflow-hidden">
      <Header />

      {/* SUB-HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
      
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              <div className="w-px h-6 bg-slate-200" />

              <div>
                <h1 className="text-2xl font-bold text-slate-900">{board.title}</h1>
                <p className="text-sm text-slate-500">Manage tasks and collaborate with your team</p>
              </div>

            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-2 bg-gray-900 hover:bg-slate-950 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? 'Copied!' : 'Share Board'}
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN SCROLL RUNWAY */}
      <div className="flex-1 overflow-x-auto custom-scrollbar relative">
        <div className="flex gap-6 p-8 items-start min-w-max">
          {board.lists.map((list) => (
            <Column
              key={list._id}
              list={list}
              boardId={board._id}
              isDraggingCard={isDraggingCard}
            />
          ))}

          {/* NEW LIST BUTTON */}
          <div className="w-72 shrink-0">
            {isCreatingList ? (
              <form onSubmit={handleCreateList} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 shadow-xs">
                <input
                  autoFocus
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="List Title..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs px-2.5 py-2 rounded-md focus:outline-none focus:border-slate-500 focus:bg-white transition-all placeholder:text-slate-400 font-sans"
                />
                <div className="flex gap-2 justify-end mt-1 border-t border-slate-100 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingList(false)}
                    className="text-slate-500 hover:text-slate-950 text-xs font-bold cursor-pointer px-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors"
                  >
                    Add List
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingList(true)}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-100 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer"
              >
                <Plus size={24} className="text-slate-500" />
                <span className="font-medium text-slate-700">Create New Column</span>
              </button>
            )}
          </div>
        </div>

        {/* GLOBAL FLOATING TRASH ZONE — anchored bottom-right, visible only while dragging */}
        {isDraggingCard && (
          <div
            onDragOver={handleGlobalTrashDragOver}
            onDragLeave={handleGlobalTrashDragLeave}
            onDrop={handleGlobalTrashDrop}
            className={`
              fixed bottom-8 right-8 z-50
              flex flex-col items-center justify-center gap-2
              w-20 h-20 rounded-2xl border-2 border-dashed
              transition-all duration-150 select-none pointer-events-auto
              ${isGlobalTrashHovered
                ? 'bg-red-50 border-red-400 scale-110'
                : 'bg-white border-slate-300'
              }
            `}
          >
            <Trash2
              size={22}
              className={`transition-colors duration-150 ${isGlobalTrashHovered ? 'text-red-500' : 'text-slate-400'}`}
            />
            <span className={`text-[9px] font-mono font-bold tracking-wider transition-colors duration-150 ${isGlobalTrashHovered ? 'text-red-500' : 'text-slate-400'}`}>
              {isGlobalTrashHovered ? 'RELEASE' : 'TRASH'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};