
import React, { useRef, useMemo, useState } from 'react';
import { Workout, VerificationStatus, Challenge, ChallengeStatus } from '../types';
import { RelayService } from '../services/relay';

interface ValidatorDashboardProps {
  workouts: Workout[];
  challenges: Challenge[];
  onUpdateStatus: (id: string, status: VerificationStatus, reason?: string) => void;
  onUpdateChallengeStatus: (id: string, status: ChallengeStatus) => void;
  onImport: (workouts: Workout[]) => void;
  onBack: () => void;
}

const ValidatorDashboard: React.FC<ValidatorDashboardProps> = ({ workouts, challenges, onUpdateStatus, onUpdateChallengeStatus, onImport, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'mempool' | 'settlement'>('mempool');
  const [isSyncing, setIsSyncing] = useState(false);

  const haptic = (p: number | number[]) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const handleManualSync = async () => {
    setIsSyncing(true);
    haptic([50, 30, 50]);
    try {
      const data = await RelayService.fetchGlobalLedger();
      if (data && data.length > 0) {
        onImport(data as Workout[]);
      }
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        haptic(100);
      }, 1000);
    }
  };

  const pendingWorkouts = useMemo(() => 
    workouts.filter(w => w.verificationStatus === 'pending' || w.verificationStatus === 'flagged'), 
    [workouts]
  );
  
  const settlementQueue = useMemo(() => 
    challenges.filter(c => c.status === 'finalizing'), 
    [challenges]
  );

  const performAction = (id: string, status: VerificationStatus) => {
    let reason = undefined;
    if (status === 'flagged') {
      reason = window.prompt("Reason for flagging this block?") || "Requires additional proof";
    }
    
    if (status === 'rejected') {
      if (!window.confirm("Remove this entry permanently?")) return;
    }

    haptic(status === 'verified' ? 100 : [100, 50, 100]);
    onUpdateStatus(id, status, reason);
  };

  const settleChallenge = (id: string, success: boolean) => {
    if (success) {
      haptic([50, 50, 150]);
      onUpdateChallengeStatus(id, 'settled');
    } else {
      haptic([100, 50, 100]);
      onUpdateChallengeStatus(id, 'active');
    }
  };

  return (
    <div className="space-y-8 pb-32 page-transition pt-2">
      <div className="bg-zinc-950 rounded-[2.5rem] p-8 border border-bitcoin/30 shadow-bitcoin/10 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none rotate-12">
           <i className="fa-solid fa-shield-halved text-8xl text-bitcoin"></i>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-bitcoin flex items-center gap-2">
              <i className="fa-solid fa-tower-observation animate-pulse"></i>
              Command Station
            </h3>
            <p className="text-xl font-black italic uppercase text-white">Consensus Controller</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleManualSync}
              disabled={isSyncing}
              className="py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all btn-press flex items-center justify-center gap-2 border border-white/5"
            >
              {isSyncing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-sync"></i>}
              Sync Relay
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all btn-press flex items-center justify-center gap-2 border border-white/5"
            >
              <i className="fa-solid fa-file-import"></i>
              Import
            </button>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={(e) => {}} className="hidden" accept=".json" />
      </div>

      <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
        <button 
          onClick={() => { setActiveTab('mempool'); haptic(20); }}
          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'mempool' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-soft' : 'text-zinc-400'
          }`}
        >
          Mempool ({pendingWorkouts.length})
        </button>
        <button 
          onClick={() => { setActiveTab('settlement'); haptic(20); }}
          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'settlement' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-soft' : 'text-zinc-400'
          }`}
        >
          Settlements ({settlementQueue.length})
        </button>
      </div>

      {activeTab === 'mempool' ? (
        <div className="space-y-4">
          {pendingWorkouts.length === 0 ? (
            <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 animate-enter">
              <i className="fa-solid fa-circle-check text-4xl text-zinc-200 dark:text-zinc-800 mb-6"></i>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Mempool Clear</p>
            </div>
          ) : (
            pendingWorkouts.map((w, idx) => (
              <div key={w.id + idx} className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-soft space-y-5 animate-enter">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">NODE: {w.participantName}</span>
                    <h4 className="font-black text-lg uppercase text-zinc-900 dark:text-white italic leading-none">{w.exercise}</h4>
                    <p className="text-[10px] font-bold text-bitcoin uppercase tracking-widest">{w.reps}R • {w.sets}S</p>
                  </div>
                  <a href={w.xProofUrl} target="_blank" className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-bitcoin shadow-hard btn-press">
                    <i className="fa-brands fa-x-twitter text-xl"></i>
                  </a>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button 
                    onClick={() => performAction(w.id, 'verified')} 
                    className="py-3 bg-zinc-950 dark:bg-zinc-800 text-white rounded-xl font-black uppercase text-[9px] tracking-widest btn-press"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => performAction(w.id, 'flagged')} 
                    className="py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 rounded-xl font-black uppercase text-[9px] tracking-widest btn-press"
                  >
                    Flag
                  </button>
                  <button 
                    onClick={() => performAction(w.id, 'rejected')} 
                    className="py-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-xl font-black uppercase text-[9px] tracking-widest btn-press"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {settlementQueue.length === 0 ? (
            <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 animate-enter">
              <i className="fa-solid fa-coins text-4xl text-zinc-200 dark:text-zinc-800 mb-6"></i>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">No pending payouts</p>
            </div>
          ) : (
            settlementQueue.map(c => (
              <div key={c.id} className="p-8 bg-zinc-950 rounded-[2.5rem] border border-bitcoin/30 space-y-6 animate-enter shadow-bitcoin/10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <i className="fa-solid fa-bolt text-bitcoin text-xs"></i>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">{c.rewardSats?.toLocaleString()} SATS</span>
                    </div>
                    <h4 className="font-black text-xl uppercase text-white italic leading-tight">{c.title}</h4>
                  </div>
                  <a href={c.payoutProofUrl} target="_blank" className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 btn-press">
                    <i className="fa-solid fa-eye"></i>
                  </a>
                </div>
                
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                   <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Audit Log</p>
                   <p className="text-[11px] text-zinc-300 font-medium leading-relaxed italic">Node {c.creatorNode} requests settlement. Verify proof-of-payout via the provided link before approving finality.</p>
                </div>

                <div className="flex gap-3 pt-2">
                   <button 
                     onClick={() => settleChallenge(c.id, true)} 
                     className="flex-1 py-4 bitcoin-gradient text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-bitcoin btn-press"
                   >
                     Approve
                   </button>
                   <button 
                     onClick={() => settleChallenge(c.id, false)} 
                     className="px-6 py-4 bg-white/5 text-zinc-500 rounded-2xl font-black uppercase text-[10px] btn-press"
                   >
                     Reject
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ValidatorDashboard;
