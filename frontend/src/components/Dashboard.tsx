import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateBoardModal } from './CreateBoardModal.jsx';
import { Layers, Calendar, ChevronRight } from 'lucide-react';

interface BoardSummary {
  _id: string;
  title: string;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAllBoards = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/boards');
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (err) {
      console.error("Error loading dashboard indices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBoards();
  }, []);

  if (loading) return <div className="text-slate-400 p-8 text-center">Loading Workspaces...</div>;

  return (
    <div className="max-w-6xl mx-auto w-full p-8 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Your Workspaces</h2>
          <p className="text-xs text-slate-400">Select an active collaborative channel or deploy a new one.</p>
        </div>
        {/* Pass navigate to handle automatic routing on creation */}
        <CreateBoardModal onSuccess={(newId) => navigate(`/board/${newId}`)} />
      </div>

      {boards.length === 0 ? (
        <div className="flex-1 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto my-auto">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-indigo-400 mb-4 shadow-xl">
            <Layers size={28} />
          </div>
          <h3 className="text-md font-bold text-slate-200 mb-1">No Boards Discovered</h3>
          <p className="text-xs text-slate-400 mb-4">You haven't instantiated any workspaces yet in this cluster instance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((b) => (
            <div
              key={b._id}
              onClick={() => navigate(`/board/${b._id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 group flex flex-col justify-between h-36 relative overflow-hidden shadow-lg"
            >
              <div>
                <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors truncate pr-6">{b.title}</h4>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider block mt-1">ID: {b._id}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Calendar size={12} className="text-slate-500" />
                <span>Created {new Date(b.createdAt).toLocaleDateString()}</span>
              </div>

              <ChevronRight size={16} className="absolute bottom-5 right-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};