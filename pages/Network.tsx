
import React, { useState, useEffect, useMemo } from 'react';
import { PeerWorkout, VerificationStatus } from '../types';
import { RelayService } from '../services/relay';
import { BITFITNESS_LOGO } from '../constants';

interface NetworkProps {
  currentUserName: string;
}

const Network: React.FC<NetworkProps> = ({ currentUserName }) => {
  const [peerActivity, setPeerActivity] = useState<PeerWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<VerificationStatus | 'all'>('all');
  const [stats, setStats] = useState({ totalReps: 0, activeNodes: 0 });

  const syncNetwork = async () => {
    const data = await RelayService.fetchGlobalLedger();
    setPeerActivity(data);
    setStats(RelayService.getNetworkStats());
    setIsLoading(false);
  };

  useEffect(() => {
    syncNetwork();
    const interval = setInterval(syncNetwork, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredActivity = useMemo(() => {
    if (filter === 'all') return peerActivity;
    return peerActivity.filter(p => p.verificationStatus === filter);
  }, [peerActivity, filter]);

  return (
    <div className="space-y-8 pb-32 page-transition">
      <header className="flex justify-between items-start px-1">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Global Relay</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Distributed Ledger Stream</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ripple"></span>
          <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Online</span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-soft">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Global Hashrate</span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.totalReps.toLocaleString()} <span className="text-[10px] font-bold opacity-30 ml-1 uppercase">Reps</span></div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-soft">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Peer Nodes</span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.activeNodes.toLocaleString()} <span className="text-[10px] font-bold opacity-30 ml-1 uppercase">Nodes</span></div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scroll-container pb-2">
        {['all', 'verified', 'pending', 'rejected', 'flagged'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 border ${
              filter === f 
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-soft' 
                : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-100 dark:border-zinc-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        {filteredActivity.length === 0 && !isLoading ? (
          <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <i className="fa-solid fa-satellite-dish text-2xl text-zinc-200 dark:text-zinc-800 mb-4"></i>
            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">No activity found in mempool</p>
          </div>
        ) : (
          filteredActivity.map((p, idx) => (
            <div key={p.id + idx} className={`group p-5 rounded-3xl flex items-center justify-between transition-all border animate-enter shadow-soft hover:shadow-hard ${
              p.peerName === currentUserName 
                ? 'bg-bitcoin/5 border-bitcoin/20' 
                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
            }`} style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  p.peerName === currentUserName ? 'bg-zinc-950 text-bitcoin border-white/10' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-100 dark:border-zinc-700'
                }`}>
                  {p.peerName === currentUserName ? (
                    <img src={BITFITNESS_LOGO} alt="Self" className="w-7 h-7" />
                  ) : (
                    <i className="fa-solid fa-user text-lg"></i>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-black text-[10px] uppercase tracking-tight ${p.peerName === currentUserName ? 'text-bitcoin' : 'text-zinc-500'}`}>
                      {p.peerName === currentUserName ? 'LOCAL_NODE' : p.peerName}
                    </span>
                    {p.challengeName && (
                      <span className="text-[7px] font-bold text-bitcoin/60 bg-bitcoin/5 px-2 py-0.5 rounded uppercase truncate">
                        {p.challengeName}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100 leading-none truncate">{p.exercise}</h4>
                  <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-widest">{p.reps}R • {p.sets || 1}S</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  p.verificationStatus === 'verified' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                  p.verificationStatus === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                  'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}>
                  {p.verificationStatus}
                </span>
                <span className="text-[8px] font-mono text-zinc-400 opacity-60">#{p.id?.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Network;
