import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import { Column } from '../components/Column';
import { Header } from '../components/Header';
import { Plus, ArrowLeft, Share2, Check, ShieldAlert, RefreshCw, Trash2, Bell } from 'lucide-react';

export const Board: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    board, fetchBoard, initStore, disconnectStore, addList,
    isLoading, error, actionError, user, dragDeleteCard, socket,
  } = useBoardStore();

  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [isGlobalTrashHovered, setIsGlobalTrashHovered] = useState(false);
  const [boardNotice, setBoardNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) return;
    initStore(boardId);
    fetchBoard(boardId);
    return () => disconnectStore();
  }, [boardId, initStore, fetchBoard, disconnectStore]);

  useEffect(() => {
    const onDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement)?.dataset?.cardid) setIsDraggingCard(true);
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

  // auto-dismiss the transient action error banner after 3s
  useEffect(() => {
    if (!actionError) return;
    const timer = setTimeout(() => {
      useBoardStore.setState({ actionError: null });
    }, 3000);
    return () => clearTimeout(timer);
  }, [actionError]);

  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleBoardMutation = () => {
      setBoardNotice('Board updated by another user');

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('CollabBoard', {
          body: 'A board change was detected.',
        });
      }

      const timer = setTimeout(() => setBoardNotice(null), 3000);
      return () => clearTimeout(timer);
    };

    socket.on('board_mutated_remote', handleBoardMutation);

    return () => {
      socket.off('board_mutated_remote', handleBoardMutation);
    };
  }, [socket]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !board) return;
    await addList(board._id, newListTitle.trim());
    setNewListTitle('');
    setIsCreatingList(false);
  };

  const handleCopyInvite = () => {
    if (!board) return;
    navigator.clipboard.writeText(`${window.location.origin}/invite/${board._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGlobalTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalTrashHovered(true);
  };
  const handleGlobalTrashDragLeave = () => setIsGlobalTrashHovered(false);
  const handleGlobalTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalTrashHovered(false);
    setIsDraggingCard(false);
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData || !board) return;
    const { cardId, fromListId } = JSON.parse(rawData);
    dragDeleteCard(board._id, cardId, fromListId);
  };

  // ── STATE SCREENS ──────────────────────────────────────────────
  if (!user) return (
    <div className="min-h-screen flex flex-col bg-[#f5f4f0] text-[#0d0d14] font-sans antialiased">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white border border-[#d6d3cc] rounded-3xl px-8 py-10 max-w-[22rem] w-full text-center shadow-[0_8px_32px_0_rgba(13,13,20,.14)]">
          <ShieldAlert size={28} className="text-[#0d0d14] mx-auto mb-4" />
          <p className="font-['Syne'] text-[0.85rem] font-bold tracking-[.1em] uppercase mb-2">Access Denied</p>
          <p className="text-[0.78rem] text-[#999] mb-6 leading-relaxed">
            You must be securely logged in to view workspace boards.
          </p>
          <button
            className="bg-[#0d0d14] hover:bg-[#5b4fff] text-white text-[0.82rem] font-semibold px-6 py-2.5 rounded-[10px] transition-colors"
            onClick={() => navigate('/')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-[#f5f4f0] text-[#0d0d14] font-sans antialiased">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#aaa]">
          <RefreshCw size={18} className="animate-spin" />
          <span className="font-['Syne'] text-[0.7rem] font-bold tracking-[.14em] uppercase">
            Syncing Board…
          </span>
        </div>
      </div>
    </div>
  );

  if (error || !board) return (
    <div className="min-h-screen flex flex-col bg-[#f5f4f0] text-[#0d0d14] font-sans antialiased">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white border border-[#d6d3cc] rounded-3xl px-8 py-10 max-w-[22rem] w-full text-center shadow-[0_8px_32px_0_rgba(13,13,20,.14)]">
          <p className="font-['Syne'] text-[0.85rem] font-bold tracking-[.1em] uppercase mb-2 text-red-600">
            Workspace Fault
          </p>
          <p className="font-mono text-[0.72rem] text-[#aaa] bg-[#eceae4] border border-[#d6d3cc] rounded-[10px] px-3 py-2 mb-6 break-all">
            {error || 'MISSING_BOARD_OBJECT'}
          </p>
          <button
            className="bg-[#0d0d14] hover:bg-[#5b4fff] text-white text-[0.82rem] font-semibold px-6 py-2.5 rounded-[10px] transition-colors"
            onClick={() => navigate('/')}
          >
            Back to Hub
          </button>
        </div>
      </div>
    </div>
  );

  // ── MAIN VIEW ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f4f0] text-[#0d0d14] font-sans antialiased">
      <Header />

      {/* SUB-HEADER */}
      <div className="bg-white border-b border-[#d6d3cc] px-10">
        <div className="max-w-[90rem] mx-auto h-[68px] flex items-center gap-5">
          <button
            className="flex items-center gap-2 text-[#888] hover:text-[#0d0d14] hover:bg-[#eceae4] text-[0.82rem] font-medium px-3 py-1.5 rounded-[10px] transition-colors shrink-0"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <div className="w-px h-7 bg-[#d6d3cc] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-['Syne'] text-xl font-bold leading-tight truncate">
              {board.title}
            </div>
            <div className="text-xs text-[#999] mt-0.5">
              Manage tasks and collaborate with your team
            </div>
          </div>
          <button
            className={`flex items-center gap-2 text-white text-[0.8rem] font-medium px-4 py-2 rounded-[10px] transition-all shrink-0 hover:-translate-y-0.5 ${
              copied ? 'bg-green-600' : 'bg-[#0d0d14] hover:bg-[#5b4fff]'
            }`}
            onClick={handleCopyInvite}
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Link copied!' : 'Share Board'}
          </button>
        </div>
      </div>

      {/* ACTION ERROR BANNER (non-blocking, transient) */}
      {actionError && (
        <div className="bg-[#fff1f3] border border-[#ff4f6d] text-[#ff4f6d] text-[0.8rem] font-medium text-center px-10 py-2.5">
          {actionError}
        </div>
      )}

      {boardNotice && (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-2xl border border-white/10 bg-[#0d0d14]/95 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_45px_rgba(13,13,20,0.28)] backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-[#5b4fff]/20 p-1.5 text-[#b7bcff]">
              <Bell size={14} />
            </div>
            <div>
              <div className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#b7bcff]">
                Board Update
              </div>
              <div className="mt-1 text-[0.8rem] text-white/90">{boardNotice}</div>
            </div>
          </div>
        </div>
      )}

      {/* KANBAN RUNWAY */}
      <div className="flex-1 overflow-x-auto px-10 pt-8 pb-12 scrollbar-thin">
        <div className="flex gap-5 items-start min-w-max">
          {board.lists.map((list) => (
            <Column
              key={list._id}
              list={list}
              boardId={board._id}
              isDraggingCard={isDraggingCard}
            />
          ))}

          {/* NEW LIST */}
          <div className="w-[272px] shrink-0">
            {isCreatingList ? (
              <form
                onSubmit={handleCreateList}
                className="bg-white border border-[#d6d3cc] rounded-2xl p-4 flex flex-col gap-2 shadow-[0_2px_12px_0_rgba(13,13,20,.08)]"
              >
                <input
                  autoFocus
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Column title…"
                  className="w-full bg-[#eceae4] border border-[#d6d3cc] text-[#0d0d14] text-[0.82rem] px-3 py-2 rounded-[10px] outline-none transition-all placeholder:text-[#bbb] focus:border-[#5b4fff] focus:bg-white focus:shadow-[0_0_0_3px_rgba(91,79,255,.12)]"
                />
                <div className="flex gap-2 justify-end border-t border-[#eceae4] pt-2 mt-1">
                  <button
                    type="button"
                    className="text-[#999] hover:text-[#0d0d14] hover:bg-[#eceae4] text-[0.78rem] font-medium px-2.5 py-1.5 rounded-[10px] transition-colors"
                    onClick={() => setIsCreatingList(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0d0d14] hover:bg-[#5b4fff] text-white text-[0.78rem] font-semibold px-3.5 py-1.5 rounded-[10px] transition-colors"
                  >
                    Add Column
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="w-full h-36 rounded-2xl border-2 border-dashed border-[#d6d3cc] flex flex-col items-center justify-center gap-2.5 text-[#aaa] hover:border-[#5b4fff] hover:bg-[#5b4fff]/5 hover:text-[#5b4fff] transition-colors"
                onClick={() => setIsCreatingList(true)}
              >
                <Plus size={22} />
                <span className="text-[0.82rem] font-medium">New Column</span>
              </button>
            )}
          </div>
        </div>

        {/* FLOATING TRASH DROP ZONE */}
        {isDraggingCard && (
          <div
            className={`fixed bottom-8 right-8 z-50 flex flex-col items-center justify-center gap-1.5 w-20 h-20 rounded-2xl border-2 border-dashed shadow-[0_8px_32px_0_rgba(13,13,20,.14)] transition-all select-none ${
              isGlobalTrashHovered
                ? 'bg-[#fff1f3] border-[#ff4f6d] scale-110'
                : 'bg-white border-[#d6d3cc]'
            }`}
            onDragOver={handleGlobalTrashDragOver}
            onDragLeave={handleGlobalTrashDragLeave}
            onDrop={handleGlobalTrashDrop}
          >
            <Trash2
              size={20}
              color={isGlobalTrashHovered ? '#ff4f6d' : '#bbb'}
              className="transition-colors"
            />
            <span
              className={`font-['Syne'] text-[0.55rem] font-bold tracking-[.08em] uppercase transition-colors ${
                isGlobalTrashHovered ? 'text-[#ff4f6d]' : 'text-[#bbb]'
              }`}
            >
              {isGlobalTrashHovered ? 'RELEASE' : 'TRASH'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};