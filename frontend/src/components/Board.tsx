import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // <--- Added hooks
import { useBoardStore } from '../store/useBoardStore.js';
import { Column } from './Column.js';
import { Kanban, Plus, ArrowLeft } from 'lucide-react';

export const Board: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>(); // <--- Dynamically tracks browser URL
  const navigate = useNavigate();
  
  const { board, fetchBoard, initStore, disconnectStore, addList, isLoading, error } = useBoardStore();
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  useEffect(() => {
    if (!boardId) return;
    
    initStore(boardId);
    fetchBoard(boardId);

    return () => {
      disconnectStore();
    };
  }, [boardId]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !board) return;
    await addList(board._id, newListTitle.trim());
    setNewListTitle('');
    setIsCreatingList(false);
  };

  if (isLoading) return <div className="text-slate-400 p-8 text-center">Hydrating Sync Engines...</div>;
  if (error) return (
    <div className="text-center p-12">
      <p className="text-red-400 mb-4 font-mono">Workspace Connection Fault: {error}</p>
      <button onClick={() => navigate('/')} className="text-xs bg-slate-800 px-4 py-2 rounded-xl text-white">Return to Dashboard</button>
    </div>
  );
  if (!board) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      {/* Sub Header Action Bar */}
      <div className="px-8 py-3 bg-slate-950/20 border-b border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-900 rounded-lg flex items-center gap-1 text-xs font-medium pr-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-2">
            <Kanban size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold tracking-wide text-slate-200">{board.title}</h2>
          </div>
        </div>
      </div>

      {/* Sliding Track for Kanban lists */}
      <div className="flex-1 p-8 overflow-x-auto flex gap-6 items-start">
        {board.lists.map((list) => (
          <Column key={list._id} list={list} boardId={board._id} />
        ))}

        <div className="w-80 shrink-0">
          {isCreatingList ? (
            <form onSubmit={handleCreateList} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
              <input
                autoFocus
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="List Title..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2 rounded-xl focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg">
                  Create List
                </button>
                <button type="button" onClick={() => setIsCreatingList(false)} className="text-slate-400 hover:text-white text-xs">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingList(true)}
              className="w-full bg-slate-900/30 hover:bg-slate-900/60 border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-medium text-xs py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Append Pipeline Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
};