
import React, { useState, useEffect } from 'react';
import { AppState, Page, Workout } from '../types';
import { BITCOIN_QUOTES, BITFITNESS_LOGO } from '../constants';

interface HomeProps {
  state: AppState;
  onNavigate: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ state, onNavigate }) => {
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return day % BITCOIN_QUOTES.length;
  });

  const [isVisible, setIsVisible] = useState(true);
  const [blockHeight, setBlockHeight] = useState(840000 + state.workouts.length);
  const [isMilestoneDismissed, setIsMilestoneDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setQuoteIndex((prevIndex) => (prevIndex + 1) % BITCOIN_QUOTES.length);
        setIsVisible(true);
      }, 500);
    }, 60000);

    const heartbeat = setInterval(() => {
      if (Math.random() > 0.8) setBlockHeight(h => h + 1);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(heartbeat);
    };
  }, []);

  const quote = BITCOIN_QUOTES[quoteIndex];
  const streak = state.stats.streak;
  
  // Detect 7-day milestone (7, 14, 21...)
  const isMilestoneHit = streak > 0 && streak % 7 === 0 && !isMilestoneDismissed;

  const formatDuration = (exercise: string, duration?: number) => {
    if (!duration) return '';
    const unit = exercise.toLowerCase().includes('run') ? 'min' : 
                 exercise.toLowerCase().includes('plank') ? 'sec' : 'min';
    return `• ${duration}${unit}`;
  };

  return (
    <div className="space-y-10">
      {/* Network Connectivity */}
      <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-900/50 py-2 px-4 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-inner">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="block w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="absolute inset-0 bg-green-500 rounded-full animate-ripple"></span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Node Synchronized</span>
        </div>
        <div className="text-[10px] font-mono font-bold text-zinc-500 tracking-tighter uppercase">
          HEIGHT <span className="text-bitcoin">#{blockHeight.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Streak Protocol Card */}
      <section className="relative overflow-hidden bg-zinc-950 dark:bg-zinc-900 rounded-[40px] p-8 text-white shadow-2xl bitcoin-glow">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group">
           <i className="fa-brands fa-bitcoin text-[180px] translate-x-12 -translate-y-12 rotate-12 group-hover:rotate-0 transition-transform duration-1000"></i>
        </div>
        
        <div className="relative z-10 space-y-8">
          <header className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-bitcoin/80">Proof of Work Chain</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-extrabold italic tracking-tighter">{streak}</span>
                <span className="text-xl font-bold text-zinc-500 italic uppercase">Blocks</span>
              </div>
            </div>
            <div className="w-16 h-16 bitcoin-gradient rounded-[24px] flex items-center justify-center shadow-xl rotate-3">
              <i className="fa-solid fa-bolt-lightning text-white text-3xl"></i>
            </div>
          </header>
          
          <div className="flex items-center gap-4 py-4 border-y border-white/5">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-2xl border-4 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">
                  {i === 0 ? <img src={BITFITNESS_LOGO} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-ninja text-xs text-zinc-600"></i>}
                </div>
              ))}
              <div className="w-10 h-10 rounded-2xl border-4 border-zinc-950 bg-bitcoin/20 flex items-center justify-center shadow-lg">
                <span className="text-[8px] font-black text-bitcoin">+21K</span>
              </div>
            </div>
            <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">Global Hashrate Peak</p>
          </div>

          <p className="text-base text-zinc-400 font-medium leading-relaxed italic">
            "Every rep is a hash computed. Every set is a block found. Your growth is immutable."
          </p>
        </div>
      </section>

      {/* Milestone Reward Prompt */}
      {isMilestoneHit && (
        <div className="relative group/reward overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 bg-bitcoin/10 border-2 border-bitcoin/30 rounded-[32px] p-6 flex items-center justify-between shadow-2xl shadow-bitcoin/10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/reward:translate-x-full transition-transform duration-1000"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bitcoin-gradient rounded-[20px] flex items-center justify-center text-white shadow-xl animate-bounce">
              <i className="fa-solid fa-gift text-2xl"></i>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-base font-black uppercase text-zinc-900 dark:text-white leading-tight">Milestone Reached!</h4>
              <p className="text-[10px] font-black text-bitcoin uppercase tracking-[0.2em]">Protocol Rewards Ready</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={() => onNavigate('settings')}
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Claim Sats
            </button>
            <button 
              onClick={() => setIsMilestoneDismissed(true)}
              className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              aria-label="Dismiss milestone"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>
      )}

      {/* Daily Intelligence Section */}
      <section className="relative group bg-white dark:bg-zinc-900/40 rounded-[32px] p-8 border border-zinc-200 dark:border-white/5 transition-all hover:shadow-2xl">
        <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-bitcoin/10 flex items-center justify-center text-bitcoin">
              <i className="fa-solid fa-quote-left text-xs"></i>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Daily Intelligence</span>
          </div>
          <p className="text-2xl font-extrabold leading-[1.15] text-zinc-900 dark:text-zinc-50 italic tracking-tight">"{quote}"</p>
        </div>
      </section>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-5">
        <div className="relative group">
          <button 
            onClick={() => onNavigate('log')} 
            className="w-full relative overflow-hidden group/btn bg-bitcoin rounded-[32px] p-8 text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-bitcoin/20"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all duration-700">
              <i className="fa-solid fa-plus text-7xl"></i>
            </div>
            <div className="relative z-10 flex flex-col items-start gap-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <i className="fa-solid fa-dumbbell text-2xl"></i>
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-black uppercase tracking-widest opacity-80 mb-1">Compute</span>
                <span className="block text-xl font-black italic uppercase leading-none">Log Block</span>
              </div>
            </div>
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
              Start new workout
            </div>
          </div>
        </div>

        <div className="relative group">
          <button 
            onClick={() => onNavigate('challenges')} 
            className="w-full relative overflow-hidden group/btn bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[32px] p-8 text-zinc-900 dark:text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/btn:scale-125 transition-all duration-700">
              <i className="fa-solid fa-flag text-7xl"></i>
            </div>
            <div className="relative z-10 flex flex-col items-start gap-6">
              <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-trophy text-2xl text-bitcoin"></i>
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-1">Missions</span>
                <span className="block text-xl font-black italic uppercase leading-none">Quests</span>
              </div>
            </div>
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
              Join challenges
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ledger History Scrollable Feed */}
      <section className="space-y-6 pt-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Recent Ledger Stream</h3>
          <button onClick={() => onNavigate('progress')} className="text-[10px] font-extrabold uppercase text-bitcoin bg-bitcoin/10 px-3 py-1.5 rounded-full hover:bg-bitcoin/20 transition-colors">Explorer</button>
        </div>
        
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 pb-6 scroll-smooth custom-scrollbar">
          {state.workouts.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800/50">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
                <i className="fa-solid fa-microchip text-3xl"></i>
              </div>
              <p className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest">Awaiting Genesis Block</p>
            </div>
          ) : (
            state.workouts.slice(0, 5).map((w, i) => (
              <div key={w.id} className="relative group/workout-tooltip">
                <div 
                  className="group flex flex-col p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-white/5 transition-all hover:scale-[1.01] shadow-sm hover:shadow-xl hover:border-bitcoin/20 animate-in fade-in slide-in-from-bottom-4" 
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-5 w-full">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                      w.verificationStatus === 'verified' ? 'bg-zinc-900 dark:bg-zinc-800 border border-white/5' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}>
                      <i className={`fa-solid ${w.exercise.toLowerCase().includes('run') ? 'fa-person-running' : 'fa-dumbbell'} text-xl ${w.verificationStatus === 'verified' ? 'text-bitcoin' : ''}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-base uppercase tracking-tight text-zinc-900 dark:text-white truncate mb-1">{w.exercise}</h4>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        {w.reps}R • {w.sets}S {formatDuration(w.exercise, w.duration)}
                        <span className="opacity-30">•</span>
                        {new Date(w.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm ${
                        w.verificationStatus === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                      }`}>
                        {w.verificationStatus}
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-tighter">BLOCK #{w.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  {w.validatorReason && (
                    <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic">
                      <span className="font-black text-bitcoin uppercase mr-1 not-italic">Note:</span>
                      {w.validatorReason}
                    </div>
                  )}
                </div>

                {/* Block Detail Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-none opacity-0 group-hover/workout-tooltip:opacity-100 transition-all duration-300 z-50 transform scale-95 group-hover/workout-tooltip:scale-100 origin-bottom">
                  <div className="bg-zinc-900 dark:bg-zinc-800 text-white p-5 rounded-[28px] shadow-2xl border border-white/10 w-72 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-[9px] font-black text-bitcoin uppercase tracking-widest">Block Explorer</span>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase">#{w.id.slice(0, 16)}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Operation</span>
                        <span className="text-[11px] font-black uppercase text-white">{w.exercise}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Load Profile</span>
                        <span className="text-[11px] font-black uppercase text-white">{w.reps} Reps x {w.sets} Sets</span>
                      </div>
                      {w.duration && (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Duration</span>
                          <span className="text-[11px] font-black uppercase text-white">
                            {w.duration} {w.exercise.toLowerCase().includes('run') ? 'Min' : 'Sec'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Timestamp</span>
                        <span className="text-[9px] font-mono font-bold text-zinc-300">
                          {new Date(w.timestamp).toLocaleString([], { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Verification</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          w.verificationStatus === 'verified' ? 'bg-green-500 text-white' : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          {w.verificationStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-zinc-900 dark:bg-zinc-800 rotate-45 mx-auto -mt-2 border-r border-b border-white/10"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
