
import React, { useState, useEffect } from 'react';
import { PeerWorkout } from '../types';
import { RelayService } from '../services/relay';
import { BITFITNESS_LOGO } from '../constants';

interface NetworkProps {
  currentUserName: string;
}

const Network: React.FC<NetworkProps> = ({ currentUserName }) => {
  const [peerActivity, setPeerActivity] = useState<PeerWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <div className="space-y-8 pb-32">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Global Relay</h2>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Verified Consensus Stream</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live</span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Network Weight</span>
          <div className="text-2xl font-black text-bitcoin tracking-tighter">{stats.totalReps.toLocaleString()} <span className="text-xs font-bold italic opacity-30">REPS</span></div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Active Nodes</span>
          <div className="text-2xl font-black text-bitcoin tracking-tighter">{stats.activeNodes} <span className="text-xs font-bold italic opacity-30">PEERS</span></div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <i className="fa-solid fa-tower-broadcast text-bitcoin"></i>
            Broadcast History
          </h3>
          {isLoading && <i className="fa-solid fa-circle-notch fa-spin text-[10px] text-bitcoin"></i>}
        </div>

        <div className="space-y-4">
          {peerActivity.length === 0 && !isLoading ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
                <i className="fa-solid fa-satellite text-3xl"></i>
              </div>
              <p className="text-sm font-black uppercase text-zinc-400 tracking-widest">Scanning Frequencies...</p>
            </div>
          ) : (
            peerActivity.map((p, idx) => (
              <div key={p.id + idx} className={`group relative p-6 rounded-4xl flex items-center justify-between transition-all border animate-in slide-in-from-bottom duration-500 delay-${Math.min(idx * 100, 500)} ${
                p.peerName === currentUserName 
                  ? 'bg-bitcoin/5 border-bitcoin/30 shadow-xl shadow-bitcoin/5' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:shadow-2xl hover:border-zinc-200 dark:hover:border-zinc-700'
              }`}>
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white shrink-0 overflow-hidden shadow-inner ${
                    p.peerName === currentUserName ? 'bg-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700'
                  }`}>
                    {p.peerName === currentUserName ? (
                      <img src={BITFITNESS_LOGO} alt="Self" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-user-ninja text-xl"></i>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-black text-xs uppercase italic tracking-tight ${p.peerName === currentUserName ? 'text-bitcoin' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {p.peerName === currentUserName ? 'Self' : p.peerName}
                      </span>
                      <span className="text-[8px] font-black text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {p.location || 'Node'}
                      </span>
                    </div>
                    <div className="font-black text-lg uppercase tracking-tight text-zinc-800 dark:text-zinc-200 leading-none mb-1 truncate">{p.exercise}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{p.reps}R • {p.sets || 1}S</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 text-bitcoin text-[10px] font-black uppercase">
                     <i className="fa-solid fa-check-circle text-[8px]"></i>
                     Signed
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 tracking-tighter">#{p.id?.slice(-6)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="text-center py-12 px-6 bg-zinc-950 rounded-4xl text-white overflow-hidden relative group">
        <div className="absolute inset-0 bg-bitcoin/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <img src={BITFITNESS_LOGO} alt="Protocol" className="w-12 h-12 mx-auto mb-6 grayscale brightness-150 rounded-2xl shadow-xl" />
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] leading-relaxed">
          Autonomous Fitness Protocol v1.0<br/>
          Difficulty: Harder than yesterday
        </p>
      </footer>
    </div>
  );
};

export default Network;
