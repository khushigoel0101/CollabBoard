import React, { useState } from 'react';
import { type IList } from '../types/index.js';
import { Card } from './Card.js';
import { useBoardStore } from '../store/useBoardStore.js';
import { Plus, Trash2, X } from 'lucide-react';

interface ColumnProps {
  list: IList;
  boardId: string;
  isDraggingCard: boolean;
}

export const Column: React.FC<ColumnProps> = ({ list, boardId, isDraggingCard }) => {
  const [cardTitle, setCardTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isTrashHovered, setIsTrashHovered] = useState(false);

  const moveCardOptimistic = useBoardStore((state) => state.moveCardOptimistic);
  const addCard = useBoardStore((state) => state.addCard);
  const deleteList = useBoardStore((state) => state.deleteList);
  const dragDeleteCard = useBoardStore((state) => state.dragDeleteCard);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;
    const { cardId, fromListId } = JSON.parse(rawData);
    if (fromListId !== list._id || list.cards.length > 0) {
      moveCardOptimistic(cardId, fromListId, list._id, list.cards.length);
    }
  };

  // Trash zone handlers
  const handleTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTrashHovered(true);
  };

  const handleTrashDragLeave = () => {
    setIsTrashHovered(false);
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTrashHovered(false);
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;
    const { cardId, fromListId } = JSON.parse(rawData);
    dragDeleteCard(boardId, cardId, fromListId);
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    await addCard(boardId, list._id, cardTitle.trim());
    setCardTitle('');
    setIsAdding(false);
  };

  const handleDeleteList = async () => {
    await deleteList(boardId, list._id);
    setIsConfirmingDelete(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="w-72 shrink-0 bg-white border border-slate-200 rounded-md p-4 flex flex-col gap-3 shadow-2xs max-h-[calc(100vh-160px)]"
    >
      {/* COLUMN HEADER */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-900">
          {list.title}
        </h3>

        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
            {list.cards.length}
          </span>

          {/* DELETE LIST — confirm inline */}
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded px-2 py-0.5">
              <span className="text-[10px] font-mono text-red-600 font-bold">Delete?</span>
              <button
                onClick={handleDeleteList}
                className="text-[10px] font-bold text-red-600 hover:text-red-800 cursor-pointer transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              title="Delete list"
              className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer p-0.5 rounded"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* CARDS LIST SCROLLER */}
      <div className="flex flex-col gap-2 overflow-y-auto pr-0.5 custom-scrollbar min-h-[10px]">
        {list.cards.map((card) => (
          <Card
            key={card._id}
            card={card}
            listId={list._id}
          />
        ))}
      </div>

      {/* TRASH DROP ZONE — only visible while dragging a card */}
      {isDraggingCard && (
        <div
          onDragOver={handleTrashDragOver}
          onDragLeave={handleTrashDragLeave}
          onDrop={handleTrashDrop}
          className={`
            flex items-center justify-center gap-2 py-2.5 rounded-md border border-dashed
            text-xs font-mono font-bold transition-all duration-150 select-none
            ${isTrashHovered
              ? 'bg-red-50 border-red-400 text-red-500'
              : 'border-slate-200 text-slate-300'
            }
          `}
        >
          <Trash2 size={13} className={isTrashHovered ? 'text-red-400' : 'text-slate-300'} />
          {isTrashHovered ? 'RELEASE TO DELETE' : 'DROP TO TRASH'}
        </div>
      )}

      {/* INLINE CARD CREATION FOOTER */}
      {isAdding ? (
        <form onSubmit={handleCreateCard} className="flex flex-col gap-2 pt-2 border-t border-slate-100 mt-auto">
          <textarea
            autoFocus
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            placeholder="Task description..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-2 rounded-md focus:outline-none focus:border-slate-500 focus:bg-white transition-all resize-none h-16 font-sans"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-500 hover:text-slate-950 font-bold text-xs px-2 py-1 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors shadow-2xs"
            >
              Add Card
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mt-1 flex items-center justify-center gap-1.5 border border-dashed border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-950 font-bold text-xs py-2 rounded-md transition-colors cursor-pointer"
        >
          <Plus size={13} /> Add Card
        </button>
      )}
    </div>
  );
};