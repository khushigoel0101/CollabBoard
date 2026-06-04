import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import { AuthModal } from './AuthModal';
import * as api from '../api/index';
import { UserPlus, Loader2 } from 'lucide-react';

export const InviteHandler: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useBoardStore(state => state.token);
  const [showAuth, setShowAuth] = useState(false);
  const [status, setStatus] = useState('VERIFYING_WORKSPACE_SECURITY_CLEARANCE...');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!token) {
      setShowAuth(true);
      setStatus('AUTHENTICATION_REQUIRED_TO_JOIN_TEAM_CHANNEL');
      setIsProcessing(false);
      return;
    }

    const claimInvitation = async () => {
      try {
        setIsProcessing(true);
        await api.joinBoard(token!, boardId!);
        setStatus('ACCESS_GRANTED_FORWARDING_TO_CANVAS');
        setTimeout(() => navigate(`/board/${boardId}`), 1200);
      } catch (err: any) {
        setStatus(`CLEARANCE_DENIED: ${err.message || 'FAILED_TO_JOIN'}`);
        setIsProcessing(false);
      }
    };

    claimInvitation();
  }, [token, boardId, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
      
      {/* MONOCHROME STATUS ICON */}
      <div className="bg-slate-900 text-white p-3.5 rounded-md mb-4 shadow-2xs">
        {isProcessing && status.includes('VERIFYING') ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <UserPlus size={18} />
        )}
      </div>
      
      {/* SYSTEM TYPOGRAPHY */}
      <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-950 mb-1.5">
        Team Workspace Invitation
      </h2>
      
      <p className="text-[11px] font-mono font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded px-3 py-2 w-full break-all">
        {status}
      </p>
      
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};