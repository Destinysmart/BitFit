
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, Page } from '../types';
import { BITCOIN_QUOTES, BITFITNESS_LOGO } from '../constants';
import WorkoutCard from '../components/WorkoutCard';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setQuoteIndex((prevIndex) => (prevIndex + 1) % BITCOIN_QUOTES.length);
        setIsVisible(true);
      }, 500);
    }, 15000);

    const heartbeat = setInterval(() => {
      if (Math.random() > 0.85) setBlockHeight(h => h + 1);
    }, 20000);

    return () => {
      clearInterval(interval);
      clearInterval(heartbeat);
    };
  }, []);

  const quote = BITCOIN_QUOTES[quoteIndex];
  const streak = state.stats.streak;

  const haptic = useCallback((p: number | number[]) => { 
    if ('vibrate' in navigator) navigator.vibrate(p); 
  }, []);

  const recentWorkouts = useMemo(() => state.workouts.slice(0, 4), [state.workouts]);

  return (
    <div className="space-y-8 page-transition pb-12">
      {/* Network Connectivity Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="relative w-2.5 h-2.5">
            <span className="block w-full h-full bg-green-500 rounded-full"></span>
            <span className="absolute inset-0 bg-green-500 rounded-full animate-ripple"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-none">Mainnet Relay</span>
            <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-500 font-medium">#{blockHeight.toLocaleString()}</span>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('settings')}
          className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-bitcoin transition-colors"
        >
          <i className="fa-solid fa-user-circle text-xl"></i>
        </button>
      </div>

      {/* Main Stats Panel */}
      <section className="relative overflow-hidden bg-zinc-950 dark:bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-hard bitcoin-glow">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
           <i className="fa-brands fa-bitcoin text-[140px] rotate-12"></i>
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-bitcoin">Active Consensus</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter italic">{streak}</span>
                <span className="text-lg font-bold text-zinc-500 uppercase italic">Days</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5">
              <i className="fa-solid fa-fire-flame-curved text-bitcoin text-2xl"></i>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-4 rounded-3xl">
                <span className="block text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Total Reps</span>
                <span className="text-xl font-black">{state.stats.totalReps.toLocaleString()}</span>
             </div>
             <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-4 rounded-3xl">
                <span className="block text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Total Sets</span>
                <span className="text-xl font-black">{state.stats.totalSets.toLocaleString()}</span>
             </div>
          </div>
        </div>
      </section>

      {/* Primary Grid Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { onNavigate('log'); haptic(20); }} 
          className="flex flex-col items-start gap-4 p-6 bg-bitcoin rounded-[2rem] text-white shadow-bitcoin btn-press transition-all"
        >
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
            <i className="fa-solid fa-plus text-xl"></i>
          </div>
          <div className="text-left">
            <span className="block text-lg font-black italic uppercase leading-none">Log Block</span>
            <span className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Add PoW</span>
          </div>
        </button>

        <button 
          onClick={() => { onNavigate('challenges'); haptic(20); }} 
          className="flex flex-col items-start gap-4 p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] text-zinc-950 dark:text-white shadow-soft btn-press transition-all"
        >
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm">
            <i className="fa-solid fa-trophy text-xl text-bitcoin"></i>
          </div>
          <div className="text-left">
            <span className="block text-lg font-black italic uppercase leading-none">Quests</span>
            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Active Pool</span>
          </div>
        </button>
      </div>

      {/* Live Intelligence Feed */}
      <section className="relative overflow-hidden group bg-zinc-100/50 dark:bg-zinc-900/30 rounded-3xl p-6 border border-zinc-200/50 dark:border-white/5">
        <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-solid fa-quote-left text-bitcoin text-xs"></i>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Intelligence</span>
          </div>
          <p className="text-lg font-bold leading-snug text-zinc-800 dark:text-zinc-100 italic">"{quote}"</p>
        </div>
      </section>

      {/* Activity Feed Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Node Activity Stream</h3>
          <button 
            onClick={() => onNavigate('progress')}
            className="text-[10px] font-bold text-bitcoin hover:underline"
          >
            See All
          </button>
        </div>
        
        <div className="space-y-4">
          {recentWorkouts.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800/50">
              <i className="fa-solid fa-box-open text-2xl text-zinc-200 dark:text-zinc-700 mb-3"></i>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Awaiting Genesis Block</p>
            </div>
          ) : (
            recentWorkouts.map((w, i) => (
              <WorkoutCard key={w.id} workout={w} index={i} isSelf={true} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Home);
