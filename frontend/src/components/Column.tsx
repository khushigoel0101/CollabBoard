import React, { useState } from 'react';
import { type IList } from '../types/index.js';
import { Card } from './Card.js';
import { useBoardStore } from '../store/useBoardStore.js';
import { Plus, MoreHorizontal } from 'lucide-react';

interface ColumnProps {
  list: IList;
  boardId: string;
}

export const Column: React.FC<ColumnProps> = ({ list, boardId }) => {
  const [cardTitle, setCardTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const moveCardOptimistic = useBoardStore((state) => state.moveCardOptimistic);
  const addCard = useBoardStore((state) => state.addCard);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping dropping elements
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    const { cardId, fromListId } = JSON.parse(rawData);
    
    // Drop card at the bottom of the column for this basic implementation
    if (fromListId !== list._id || list.cards.length > 0) {
      moveCardOptimistic(cardId, fromListId, list._id, list.cards.length);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    await addCard(boardId, list._id, cardTitle.trim());
    setCardTitle('');
    setIsAdding(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="w-80 shrink-0 bg-slate-900/80 rounded-2xl border border-slate-800/80 p-4 flex flex-col gap-4 shadow-xl max-h-[calc(100vh-140px)]"
    >
      <div className="flex justify-between items-center px-1">
        <h3 className="font-semibold text-sm text-slate-200">{list.title}</h3>
        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md text-xs font-semibold font-mono">
          {list.cards.length}
        </span>
      </div>

      {/* Cards List Scroller */}
      <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
        {list.cards.map((card) => (
          <Card key={card._id} card={card} listId={list._id} />
        ))}
      </div>

      {/* Inline Card Creation Footer */}
      {isAdding ? (
        <form onSubmit={handleCreateCard} className="flex flex-col gap-2">
          <textarea
            autoFocus
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            placeholder="Enter card details..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2 rounded-xl focus:outline-none focus:border-indigo-500 resize-none h-16"
          />
          <div className="flex items-center gap-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-colors">
              Add Card
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white text-xs px-2 py-1.5">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mt-1 flex items-center justify-center gap-2 border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs py-2 rounded-xl transition-all duration-200"
        >
          <Plus size={14} /> Add Task Card
        </button>
      )}
    </div>
  );
};