import React, { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { Plus, X } from 'lucide-react';

interface CreateBoardModalProps {
  onSuccess: (newId: string) => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createNewBoard = useBoardStore((state) => state.createNewBoard);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const newBoardId = await createNewBoard(title.trim());
    setIsSubmitting(false);

    if (newBoardId) {
      setTitle('');
      setIsOpen(false);
      onSuccess(newBoardId); // Automatically redirects the user to the new board route
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON MATCHING LANDING / DASHBOARD SCHEME */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
      >
        <Plus size={14} /> Create New Board
      </button>

      {isOpen && (
        /* FIXED: Corrected the broken z-index property to fully layer correctly */
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 rounded-xl shadow-2xl relative text-slate-900">
            
            {/* CLOSE BUTTON */}
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* HEADER TEXT */}
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-tight font-sans">Establish New Workspace</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              This will automatically generate default lists (To Do, In Progress, Done). You can customize the board further once it's created.
            </p>

            {/* DIRECT ACTION FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Board Workspace Title
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Development Sprint Alpha"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs px-3 py-2.5 rounded-md focus:outline-none focus:border-slate-500 focus:bg-white transition-all placeholder:text-slate-400 font-sans"
                />
              </div>

              {/* ACTION TOGGLES */}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-950 font-bold text-xs px-3 py-2 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-950 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Creating Workspace...' : 'Initialize Board'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};