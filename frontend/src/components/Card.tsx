import React from 'react';
import {type ICard } from '../types/index.js';
import { AlignLeft, Tag } from 'lucide-react';

interface CardProps {
  card: ICard;
  listId: string;
}

export const Card: React.FC<CardProps> = ({ card, listId }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card._id, fromListId: listId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-[var(--color-card-bg)] border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-md transition-all group cursor-grab active:cursor-grabbing select-none"
    >
      <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
        {card.title}
      </p>
      
      {card.description && (
        <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
          <AlignLeft size={12} />
          <span className="truncate max-w-[200px]">{card.description}</span>
        </div>
      )}

      {card.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {card.tags.map((tag, i) => (
            <span key={i} className="bg-indigo-500/10 text-indigo-400 text-[9px] tracking-wide uppercase px-2 py-0.5 rounded font-bold">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};