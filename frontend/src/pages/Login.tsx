import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { useBoardStore } from '../store/useBoardStore';
import { auth } from '../assets';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useBoardStore();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden"
      style={{
        backgroundImage: `url(${auth})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-slate-950/35" />
      <div className="relative z-10">
        <AuthForm
          isLogin={true}
          onSuccess={() => navigate('/dashboard', { replace: true })}
          onSwitchMode={() => navigate('/signup')}
        />
      </div>
    </div>
  );
};
