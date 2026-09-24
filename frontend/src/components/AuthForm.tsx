import React, { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import * as api from '../api/index';

interface AuthFormProps {
  isLogin: boolean;
  onSuccess?: () => void;
  onSwitchMode?: () => void;
  onClose?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  onSuccess,
  onSwitchMode,
  onClose
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const setAuth = useBoardStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    try {
      const data = isLogin
        ? await api.loginUser(email, password)
        : await api.registerUser(name, email, password);

      setAuth(data.user, null);
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      setErr(error?.message || 'Authentication failed');
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-slate-200 w-full p-6 rounded-md shadow-lg relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
            aria-label="Close auth dialog"
          >
            ✕
          </button>
        )}

        <h3 className="text-lg font-semibold text-slate-950 mb-4">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h3>

        {err && (
          <p className="text-sm font-medium bg-red-50 text-red-600 p-2.5 rounded border border-red-200 mb-3 break-all">
            {err}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input
              type="text"
              required
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-500 focus:bg-white text-sm px-3 py-2.5 rounded-md focus:outline-none transition-all font-sans placeholder:text-slate-400"
            />
          )}

          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 focus:border-slate-500 focus:bg-white text-sm px-3 py-2.5 rounded-md focus:outline-none transition-all font-sans placeholder:text-slate-400"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 focus:border-slate-500 focus:bg-white text-sm px-3 py-2.5 rounded-md focus:outline-none transition-all font-sans placeholder:text-slate-400"
          />

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-950 text-white font-semibold text-sm py-2.5 rounded-md cursor-pointer transition-colors mt-2"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {onSwitchMode && (
          <p className="text-center text-sm text-slate-500 mt-4 font-sans">
            {isLogin ? 'New to CollabBoard? ' : 'Already have an account? '}
            <span
              onClick={onSwitchMode}
              className="text-slate-950 font-semibold cursor-pointer hover:underline underline-offset-2"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
