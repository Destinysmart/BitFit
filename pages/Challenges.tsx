
import React from 'react';
import { Challenge } from '../types';

interface ChallengesProps {
  challenges: Challenge[];
  onJoin: (id: string) => void;
}

const Challenges: React.FC<ChallengesProps> = ({ challenges, onJoin }) => {
  const shareProgress = (ch: Challenge) => {
    const text = `I'm stacking progress on the ${ch.title} challenge in #BitFitness! ${ch.currentDays}/${ch.targetDays} days complete. Proof-of-Work in progress. 🟠💪`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-10 pb-32">
      <header className="space-y-2">
        <h2 className="text-4xl font-extrabold italic uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 leading-none">Active Quests</h2>
        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">Network Rewards Layer</p>
      </header>
      
      <div className="space-y-8">
        {challenges.map((ch, i) => (
          <div key={ch.id} className="relative group bg-white dark:bg-zinc-900 rounded-[40px] p-8 border border-zinc-100 dark:border-white/5 shadow-sm transition-all hover:shadow-2xl hover:border-bitcoin/20 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitcoin animate-pulse"></div>
                  <span className="text-[10px] font-black text-bitcoin uppercase tracking-widest bg-bitcoin/5 px-2.5 py-1 rounded-full border border-bitcoin/10">Reward Pool Active</span>
                </div>
                <h3 className="text-2xl font-extrabold uppercase text-zinc-900 dark:text-white tracking-tighter leading-tight">{ch.title}</h3>
              </div>
              {ch.joined && (
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 shadow-inner border border-green-500/20">
                  <i className="fa-solid fa-shield-check text-xl"></i>
                </div>
              )}
            </div>
            
            <p className="text-base text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed font-medium">
              {ch.description}
            </p>

            {ch.joined ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Node Sync</span>
                      <p className="text-xs font-bold text-zinc-500 uppercase">{ch.currentDays} / {ch.targetDays} Computed</p>
                    </div>
                    <span className="text-3xl font-black text-bitcoin italic tracking-tighter">{Math.round((ch.currentDays / ch.targetDays) * 100)}%</span>
                  </div>
                  <div className="w-full h-5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-1.5 shadow-inner">
                    <div 
                      className="h-full bitcoin-gradient rounded-full shadow-[0_0_20px_rgba(247,147,26,0.4)] transition-all duration-1000 ease-out"
                      style={{ width: `${(ch.currentDays / ch.targetDays) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="relative group/tooltip">
                  <button 
                    onClick={() => shareProgress(ch)}
                    className="w-full py-5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-[24px] flex items-center justify-center gap-3 hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-all font-black uppercase text-xs tracking-[0.2em] shadow-xl border border-white/5 active:scale-95"
                  >
                    <i className="fa-brands fa-x-twitter"></i>
                    Signal Proof
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
                    <div className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap">
                      Post status to X
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group/tooltip">
                <button 
                  onClick={() => onJoin(ch.id)}
                  className="w-full py-6 bitcoin-gradient text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-bitcoin/30"
                >
                  Enroll in Quest
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
                  <div className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap">
                    Join the reward pool
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global Relay Status Card */}
      <section className="p-8 bg-zinc-950 dark:bg-zinc-900 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <i className="fa-solid fa-globe text-8xl translate-x-8 -translate-y-8 animate-pulse-slow"></i>
        </div>
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-bitcoin border border-white/10 shadow-lg">
              <i className="fa-solid fa-satellite-dish text-xl"></i>
            </div>
            <h4 className="text-base font-black uppercase tracking-widest">P2P Network Status</h4>
          </div>
          <p className="text-sm font-medium text-zinc-400 leading-relaxed italic">
            "Participant mempool is synchronized. Global consensus layer is currently in testing mode. Maintain local sovereignty."
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ripple"></span>
            Relay Online
          </div>
        </div>
      </section>
    </div>
  );
};

export default Challenges;
