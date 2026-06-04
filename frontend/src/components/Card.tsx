import React from 'react';
import { type ICard } from '../types/index.js';
import { AlignLeft } from 'lucide-react';

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
      className="bg-white border border-slate-200 hover:border-slate-400 p-3.5 rounded-md shadow-2xs transition-all group cursor-grab active:cursor-grabbing select-none"
    >
      {/* CARD TITLE */}
      <p className="text-xs font-bold text-slate-900 transition-colors">
        {card.title}
      </p>
      
      {/* DESCRIPTION INDICATOR */}
      {card.description && (
        <div className="flex items-center gap-1 mt-1.5 text-slate-400 text-[11px]">
          <AlignLeft size={11} className="shrink-0" />
          <span className="truncate max-w-[200px] font-sans">{card.description}</span>
        </div>
      )}

      {/* COMPACT MINIMALIST TAG SYSTEM */}
      {card.tags && card.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {card.tags.map((tag, i) => (
            <span 
              key={i} 
              className="bg-slate-100 text-slate-700 text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded font-mono font-bold border border-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};