import React, { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { X } from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const setAuth = useBoardStore(state => state.setAuth);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    const endpoint = isLogin ? 'login' : 'register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`http://localhost:5000/api/boards/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth routing transaction collapsed');
      
      setAuth(data.user, data.token);
      onClose();
    } catch (error: any) {
      setErr(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z- p-4">
      <div className="bg-white border border-slate-200 w-full max-w-sm p-6 rounded-2xl shadow-2xl relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
        <h3 className="text-md font-bold text-slate-800 mb-4">{isLogin ? 'Sign In to Workspace' : 'Create Collaborative Profile'}</h3>
        
        {err && <p className="text-xs bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-100 mb-3 font-medium">{err}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input type="text" required placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-sm p-2.5 rounded-xl focus:outline-none" />
          )}
          <input type="email" required placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-sm p-2.5 rounded-xl focus:outline-none" />
          <input type="password" required placeholder="Security Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-sm p-2.5 rounded-xl focus:outline-none" />
          
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-2.5 rounded-xl cursor-pointer transition-colors mt-2">
            {isLogin ? 'Login Session' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-500 mt-4 font-medium">
          {isLogin ? "New to CollabBoard? " : "Already have an account? "}
          <span onClick={()=>setIsLogin(!isLogin)} className="text-green-600 cursor-pointer hover:underline">{isLogin ? 'Create one' : 'Sign in'}</span>
        </p>
      </div>
    </div>
  );
};