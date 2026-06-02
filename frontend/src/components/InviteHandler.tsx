import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import { AuthModal } from './AuthModal';
import { UserPlus } from 'lucide-react';

export const InviteHandler: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useBoardStore(state => state.token);
  const [showAuth, setShowAuth] = useState(false);
  const [status, setStatus] = useState('Verifying workspace security clearance...');

  useEffect(() => {
    if (!token) {
      setShowAuth(true);
      setStatus('Authentication required to join team channel.');
      return;
    }

    const claimInvitation = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/boards/${boardId}/join`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to accept invitation');
        
        setStatus('Access granted! Forwarding to board canvas...');
        setTimeout(() => navigate(`/board/${boardId}`), 1500);
      } catch (err: any) {
        setStatus(`Clearance Denied: ${err.message}`);
      }
    };

    claimInvitation();
  }, [token, boardId]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-purple-600 mb-4 shadow-sm animate-pulse">
        <UserPlus size={28} />
      </div>
      <h2 className="text-md font-bold text-slate-800 mb-2">Team Channel Invitation</h2>
      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{status}</p>
      
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};