import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Users } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-3 hover:scale-[1.01] transition-transform">
        <div className="bg-purple-600 p-3 rounded-xl shadow-lg">
          <LayoutGrid className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-purple-900">CollabBoard</h1>
          <span className="text-xs text-purple-950">Smart Team Workspace</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-purple-700">
          <Users size={18} />
          <span className="text-sm">Team Ready</span>
        </div>
        <div className="bg-purple-100 text-purple-700 border border-pink-300 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
          Live Sync Active
        </div>
      </div>
    </header>
  );
};