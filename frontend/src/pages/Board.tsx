import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import { Column } from '../components/Column';
import { Header } from '../components/Header';
import { Plus, ArrowLeft, Share2, Check, ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';

/* ─── design tokens (inline so this file is self-contained) ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ink:    #0d0d14;
    --paper:  #f5f4f0;
    --mist:   #eceae4;
    --border: #d6d3cc;
    --accent: #5b4fff;
    --accent2:#ff4f6d;
    --card-bg:#ffffff;
    --col-bg: #f0ede7;
    --shadow: 0 2px 12px 0 rgba(13,13,20,.08);
    --shadow-lg: 0 8px 32px 0 rgba(13,13,20,.14);
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 24px;
  }

  .board-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--paper);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }

  /* ── SUB-HEADER ── */
  .sub-header {
    background: var(--card-bg);
    border-bottom: 1px solid var(--border);
    padding: 0 2.5rem;
  }
  .sub-header-inner {
    max-width: 90rem;
    margin: 0 auto;
    height: 68px;
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #888;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius-sm);
    transition: color .18s, background .18s;
    flex-shrink: 0;
  }
  .back-btn:hover { color: var(--ink); background: var(--mist); }

  .divider { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }

  .board-title-block { flex: 1; min-width: 0; }
  .board-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .board-subtitle {
    font-size: 0.75rem;
    color: #999;
    margin-top: 1px;
    font-weight: 400;
  }

  .share-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--ink);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.55rem 1.1rem;
    border-radius: var(--radius-sm);
    transition: background .18s, transform .12s;
    flex-shrink: 0;
  }
  .share-btn:hover { background: var(--accent); transform: translateY(-1px); }
  .share-btn.copied { background: #16a34a; }

  /* ── KANBAN RUNWAY ── */
  .kanban-runway {
    flex: 1;
    overflow-x: auto;
    padding: 2rem 2.5rem 3rem;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .kanban-runway::-webkit-scrollbar { height: 6px; }
  .kanban-runway::-webkit-scrollbar-track { background: transparent; }
  .kanban-runway::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  .kanban-track {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    min-width: max-content;
  }

  /* ── NEW LIST WIDGET ── */
  .new-list-wrap { width: 272px; flex-shrink: 0; }
  .new-list-form {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    box-shadow: var(--shadow);
  }
  .new-list-input {
    width: 100%;
    background: var(--mist);
    border: 1px solid var(--border);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    outline: none;
    transition: border .15s, box-shadow .15s;
    box-sizing: border-box;
  }
  .new-list-input::placeholder { color: #bbb; }
  .new-list-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(91,79,255,.12); background: #fff; }
  .new-list-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    border-top: 1px solid var(--mist);
    padding-top: 0.5rem;
    margin-top: 0.25rem;
  }
  .btn-cancel {
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 0.78rem;
    font-weight: 500; color: #999; padding: 0.35rem 0.6rem;
    border-radius: var(--radius-sm); transition: color .15s, background .15s;
  }
  .btn-cancel:hover { color: var(--ink); background: var(--mist); }
  .btn-add-list {
    background: var(--ink); color: #fff; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 600;
    padding: 0.4rem 0.9rem; border-radius: var(--radius-sm);
    transition: background .15s;
  }
  .btn-add-list:hover { background: var(--accent); }

  .create-col-btn {
    width: 100%;
    height: 9rem;
    border-radius: var(--radius-md);
    border: 2px dashed var(--border);
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    cursor: pointer;
    transition: border-color .18s, background .18s;
    color: #aaa;
  }
  .create-col-btn:hover {
    border-color: var(--accent);
    background: rgba(91,79,255,.05);
    color: var(--accent);
  }
  .create-col-btn span {
    font-size: 0.82rem;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── GLOBAL TRASH DROP ZONE ── */
  .trash-zone {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    width: 5rem;
    height: 5rem;
    border-radius: var(--radius-md);
    border: 2px dashed var(--border);
    background: var(--card-bg);
    box-shadow: var(--shadow-lg);
    transition: all .15s;
    pointer-events: auto;
    user-select: none;
  }
  .trash-zone.hovered {
    background: #fff1f3;
    border-color: var(--accent2);
    transform: scale(1.1);
  }
  .trash-zone span {
    font-size: 0.55rem;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    letter-spacing: .08em;
    color: #bbb;
    text-transform: uppercase;
    transition: color .15s;
  }
  .trash-zone.hovered span { color: var(--accent2); }

  /* ── STATE SCREENS ── */
  .state-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .state-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 2.5rem 2rem;
    max-width: 22rem;
    width: 100%;
    text-align: center;
    box-shadow: var(--shadow-lg);
  }
  .state-icon { color: var(--ink); margin: 0 auto 1rem; display: block; }
  .state-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .state-title.error { color: #dc2626; }
  .state-body { font-size: 0.78rem; color: #999; margin-bottom: 1.5rem; line-height: 1.6; }
  .state-error-code {
    font-family: 'DM Sans', monospace;
    font-size: 0.72rem;
    color: #aaa;
    background: var(--mist);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    word-break: break-all;
    margin-bottom: 1.5rem;
  }
  .state-btn {
    background: var(--ink); color: #fff; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
    padding: 0.65rem 1.5rem; border-radius: var(--radius-sm);
    transition: background .15s;
  }
  .state-btn:hover { background: var(--accent); }

  .loading-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: #aaa;
  }
  .loading-label {
    font-family: 'Syne', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
`;

export const Board: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { board, fetchBoard, initStore, disconnectStore, addList, isLoading, error, token, dragDeleteCard } = useBoardStore();
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [isGlobalTrashHovered, setIsGlobalTrashHovered] = useState(false);

  useEffect(() => {
    if (!boardId || !token) return;
    initStore(boardId);
    fetchBoard(boardId);
    return () => disconnectStore();
  }, [boardId, token, initStore, fetchBoard, disconnectStore]);

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
  if (!token) return (
    <div className="board-root">
      <style>{css}</style>
      <Header />
      <div className="state-screen">
        <div className="state-card">
          <ShieldAlert size={28} className="state-icon" />
          <p className="state-title">Access Denied</p>
          <p className="state-body">You must be securely logged in to view workspace boards.</p>
          <button className="state-btn" onClick={() => navigate('/')}>Return to Dashboard</button>
        </div>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="board-root">
      <style>{css}</style>
      <Header />
      <div className="state-screen">
        <div className="loading-inner">
          <RefreshCw size={18} className="animate-spin" />
          <span className="loading-label">Syncing Board…</span>
        </div>
      </div>
    </div>
  );

  if (error || !board) return (
    <div className="board-root">
      <style>{css}</style>
      <Header />
      <div className="state-screen">
        <div className="state-card">
          <p className="state-title error">Workspace Fault</p>
          <p className="state-error-code">{error || 'MISSING_BOARD_OBJECT'}</p>
          <button className="state-btn" onClick={() => navigate('/')}>Back to Hub</button>
        </div>
      </div>
    </div>
  );

  // ── MAIN VIEW ──────────────────────────────────────────────────
  return (
    <div className="board-root">
      <style>{css}</style>
      <Header />

      {/* SUB-HEADER */}
      <div className="sub-header">
        <div className="sub-header-inner">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <div className="divider" />
          <div className="board-title-block">
            <div className="board-title">{board.title}</div>
            <div className="board-subtitle">Manage tasks and collaborate with your team</div>
          </div>
          <button
            className={`share-btn${copied ? ' copied' : ''}`}
            onClick={handleCopyInvite}
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Link copied!' : 'Share Board'}
          </button>
        </div>
      </div>

      {/* KANBAN RUNWAY */}
      <div className="kanban-runway">
        <div className="kanban-track">
          {board.lists.map((list) => (
            <Column
              key={list._id}
              list={list}
              boardId={board._id}
              isDraggingCard={isDraggingCard}
            />
          ))}

          {/* NEW LIST */}
          <div className="new-list-wrap">
            {isCreatingList ? (
              <form onSubmit={handleCreateList} className="new-list-form">
                <input
                  autoFocus
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Column title…"
                  className="new-list-input"
                />
                <div className="new-list-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsCreatingList(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-add-list">Add Column</button>
                </div>
              </form>
            ) : (
              <button className="create-col-btn" onClick={() => setIsCreatingList(true)}>
                <Plus size={22} />
                <span>New Column</span>
              </button>
            )}
          </div>
        </div>

        {/* FLOATING TRASH DROP ZONE */}
        {isDraggingCard && (
          <div
            className={`trash-zone${isGlobalTrashHovered ? ' hovered' : ''}`}
            onDragOver={handleGlobalTrashDragOver}
            onDragLeave={handleGlobalTrashDragLeave}
            onDrop={handleGlobalTrashDrop}
          >
            <Trash2
              size={20}
              color={isGlobalTrashHovered ? 'var(--accent2)' : '#bbb'}
              style={{ transition: 'color .15s' }}
            />
            <span>{isGlobalTrashHovered ? 'RELEASE' : 'TRASH'}</span>
          </div>
        )}
      </div>
    </div>
  );
};