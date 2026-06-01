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
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
      >
        <Plus size={14} /> Create New Board
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z- p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-md font-bold text-slate-100 mb-1">Establish New Workspace</h3>
            <p className="text-xs text-slate-400 mb-4">
              This will automatically generate default lists (To Do, In Progress, Done) directly inside MongoDB.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Board Workspace Title
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Development Sprint Alpha"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-3 py-2 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Writing to MongoDB...' : 'Initialize Board'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};