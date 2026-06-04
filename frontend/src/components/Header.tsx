import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex justify-between items-center sticky top-0 z-50">
      
      {/* BRANDING LINK */}
      <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
        <div className="bg-slate-900 p-2 rounded-md text-white">
          <LayoutGrid size={16} />
        </div>
        <div>
          <h1 className="font-bold text-sm uppercase tracking-wider font-mono text-slate-950 leading-none">
            CollabBoard
          </h1>
          <span className="text-[10px] text-slate-400 font-sans block mt-1">
            Smart Team Workspace
          </span>
        </div>
      </Link>

      {/* STATUS INDICATORS */}
      <div className="flex items-center gap-3">
        <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-[11px] font-medium font-mono text-slate-700 flex items-center gap-2 shadow-2xs">
          <Radio size={12} className="text-slate-900 animate-pulse" />
          <span>LIVE_SYNC_ACTIVE</span>
        </div>
      </div>

    </header>
  );
};