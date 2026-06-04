import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import { AuthModal } from '../components/AuthModal';
import { 
  Grid, 
  ArrowRight } from 'lucide-react';
import { TypingEffect } from '../utilities/Typing';
import {workspace} from '../assets/index';
import {pasted, dragdrop, security} from '../assets/index';


export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [inputBoardId, setInputBoardId] = useState('');
  const [errorText, setErrorText] = useState('');
  
  const { user, token } = useBoardStore();

  const handleDirectConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBoardId.trim()) {
      setErrorText('Valid repository hex token required.');
      return;
    }
    setErrorText('');
    navigate(`/board/${inputBoardId.trim()}`);
  };


   const typingPhrases = React.useMemo(() => [
    "Manage architectural project pipelines", 
    "with distributed team synchronization."
  ], []);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased font-sans flex flex-col">
      
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 text-white p-2 rounded-md">
              <Grid size={16} />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-950 uppercase block">CollabBoard</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest block -mt-1">Document Repository Hub</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 px-3.5 py-1.5 rounded-md transition-colors border border-slate-200"
              >
                Open Dashboard ({user.name.split(' ')})
              </button>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="text-xs font-bold bg-slate-900 hover:bg-slate-950 text-white px-4 py-2 rounded-md transition-colors"
              >
                Account Setup
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HIGH-CONTRAST HERO SPLIT */}
      <header className="bg-slate-950 text-white py-16 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20 font-mono">
              ORGANIZE • COLLABORATE • DELIVER
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight min-h-[96px] sm:min-h-[72px] md:min-h-[88px] flex items-start">
             <TypingEffect phrases={typingPhrases}
              typingSpeed={50}
              deletingSpeed={25}
               delayBetween={2500}
            />
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl leading-relaxed">
              Initialize modular board documents, populate tracking lists across isolated server tracks, and observe execution transformations natively as mutations happen.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => token ? navigate('/dashboard') : setShowAuthModal(true)}
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-md transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                {token ? 'Go to Active Workspaces' : 'Initialize Workspace Session'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>


        {/* FEATURES SECTION */}
    <main className="max-w-6xl mx-auto w-full px-8 py-20 flex-1">

  <div className="text-center mb-20">
    <h2 className="text-3xl font-bold text-slate-950">
      Everything Your Team Needs
    </h2>
    <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
      Manage projects, collaborate in real time, and keep work moving
      efficiently from planning to delivery.
    </p>
  </div>

  {/* SECTION 1 */}
  <section className="grid lg:grid-cols-2 gap-12 items-center mb-28">
    <div>
      <img
        src={workspace}
        alt="Shared Workspaces"
        className="rounded-2xl border border-slate-200 shadow-lg"
      />
    </div>

    <div>
      <span className="text-sky-600 font-semibold text-sm">
        01 · Shared Workspaces
      </span>

      <h3 className="text-4xl font-bold mt-3 mb-4 text-slate-950">
        Organize every project in one place
      </h3>

      <p className="text-slate-600 leading-relaxed mb-6">
        Create dedicated workspaces for different teams, clients, and
        initiatives. Keep tasks, discussions, and progress neatly separated.
      </p>
    </div>
  </section>

  {/* SECTION 2 */}
  <section className="grid lg:grid-cols-2 gap-12 items-center mb-28">
    <div className="order-2 lg:order-1">
      <span className="text-sky-600 font-semibold text-sm">
        02 · Real-Time Collaboration
      </span>

      <h3 className="text-4xl font-bold mt-3 mb-4 text-slate-950">
        Work together without delays
      </h3>

      <p className="text-slate-600 leading-relaxed mb-6">
        Every update is synced instantly across connected users, ensuring
        everyone stays aligned and up to date.
      </p>

      
    </div>

    <div className="order-1 lg:order-2">
      <img
        src={pasted}
        alt="Real Time Collaboration"
        className="rounded-2xl border border-slate-200 shadow-lg"
      />
    </div>
  </section>

  {/* SECTION 3 */}
  <section className="grid lg:grid-cols-2 gap-12 items-center mb-28">
    <div>
      <img
        src= {dragdrop}
        alt="Task Management"
        className="rounded-2xl border border-slate-200 shadow-lg"
      />
    </div>

    <div>
      <span className="text-sky-600 font-semibold text-sm">
        03 · Task Management
      </span>

      <h3 className="text-4xl font-bold mt-3 mb-4 text-slate-950">
        Move work forward visually
      </h3>

      <p className="text-slate-600 leading-relaxed mb-6">
        Drag and drop tasks between stages and track progress effortlessly with
        an intuitive workflow system.
      </p>

      
    </div>
  </section>


  {/* SECTION 4 */}
  <section className="grid lg:grid-cols-2 gap-12 items-center">
    <div className="order-2 lg:order-1">
      <span className="text-sky-600 font-semibold text-sm">
        04 · Security & Reliability
      </span>

      <h3 className="text-4xl font-bold mt-3 mb-4 text-slate-950">
        Built for secure team collaboration
      </h3>

      <p className="text-slate-600 leading-relaxed mb-6">
        Authentication, validation, and structured data handling ensure your
        workspaces remain secure and dependable.
      </p>
    </div>

    <div className="order-1 lg:order-2">
      <img
        src={security}
        alt="Security"
        className="rounded-2xl border border-slate-200 shadow-lg"
      />
    </div>
  </section>


      </main>

      {/* Auth Modal Hook */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};