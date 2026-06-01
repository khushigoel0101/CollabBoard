import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from './components/Dashboard.jsx';
import { Board } from './components/Board.js';
import { LayoutGrid } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-board-bg)] text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500/30">
        
        {/* Universal Application Shell Top Bar */}
        <header className="bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-3 active:scale-[0.99] transition-transform">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/10">
              <LayoutGrid className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-md leading-none text-white">CollabBoard Engine</h1>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider block mt-1">v2026.1.0-PRODUCTION</span>
            </div>
          </Link>
          
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live Sync Operational
          </div>
        </header>

        {/* Multi-Page Route Management Framework */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/board/:id" element={<Board />} />
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}