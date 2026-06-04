import React, { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import * as api from '../api/index';
import { X } from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const setAuth = useBoardStore((state) => state.setAuth);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    try {
      const data = isLogin
        ? await api.loginUser(email, password)
        : await api.registerUser(name, email, password);

      setAuth(data.user, data.token);
      onClose();
    } catch (error: any) {
      setErr(error?.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 w-full max-w-sm p-6 rounded-md shadow-lg relative">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
        
        {/* MODAL HEADER */}
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-950 mb-4">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h3>
        
        {/* SYSTEM STATUS ERRORS */}
        {err && (
          <p className="text-[11px] font-mono font-medium bg-red-50 text-red-600 p-2.5 rounded border border-red-200 mb-3 break-all">
            {err}
          </p>
        )}
        
        {/* AUTHENTICATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input 
              type="text" 
              required 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-500 focus:bg-white text-xs px-3 py-2 rounded-md focus:outline-none transition-all font-sans placeholder:text-slate-400" 
            />
          )}
          <input 
            type="email" 
            required 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-300 focus:border-slate-500 focus:bg-white text-xs px-3 py-2 rounded-md focus:outline-none transition-all font-sans placeholder:text-slate-400" 
          />
          <input 
            type="password" 
            required 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-300 focus:border-slate-500 focus:bg-white text-xs px-3 py-2 rounded-md focus:outline-none transition-all font-sans placeholder:text-slate-400" 
          />
          
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2.5 rounded-md cursor-pointer transition-colors mt-2 uppercase tracking-wide font-mono"
          >
            {isLogin ? 'Login Session' : 'Register Account'}
          </button>
        </form>

        {/* TOGGLE AUTHENTICATION CONTEXT */}
        <p className="text-center text-[11px] text-slate-500 mt-4 font-sans font-medium">
          {isLogin ? "New to CollabBoard? " : "Already have an account? "}
          <span 
            onClick={() => { setErr(''); setIsLogin(!isLogin); }} 
            className="text-slate-950 font-bold cursor-pointer hover:underline underline-offset-2"
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </span>
        </p>
        
      </div>
    </div>
  );
};