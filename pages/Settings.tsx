
import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { BITFITNESS_LOGO } from '../constants';

interface SettingsProps {
  state: AppState;
  onToggleTheme: () => void;
  onToggleOracle: () => void;
  onClearData: () => void;
  onExport: () => void;
  onOpenValidator: () => void;
  onUpdateProfile: (name: string, lnAddr: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onToggleTheme, onToggleOracle, onClearData, onExport, onOpenValidator, onUpdateProfile }) => {
  const { theme, aiOracleEnabled, userName, lightningAddress } = state;
  const [editName, setEditName] = useState(userName);
  const [editLnAddr, setEditLnAddr] = useState(lightningAddress);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(editName !== userName || editLnAddr !== lightningAddress);
  }, [editName, editLnAddr, userName, lightningAddress]);

  const haptic = (p: number | number[]) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const handleSaveProfile = () => {
    setIsSyncing(true);
    haptic(50);
    setTimeout(() => {
      onUpdateProfile(editName, editLnAddr);
      setIsSyncing(false);
      haptic([50, 30, 50]);
    }, 800);
  };

  const handleConnectWallet = () => {
    if (!editLnAddr || !editLnAddr.includes('@')) {
      alert("Format Error: Lightning Address required.");
      haptic([100, 50, 100]);
      return;
    }
    setIsLinkingWallet(true);
    haptic([20, 20, 20, 20]);
    setTimeout(() => {
      onUpdateProfile(editName, editLnAddr);
      setIsLinkingWallet(false);
      haptic(150);
    }, 1200);
  };

  return (
    <div className="space-y-10 pb-32 page-transition">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Node Config</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Protocol Identity Layer</p>
        </div>
        <div className="w-12 h-12 bg-zinc-950 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-bitcoin shadow-hard">
           <i className="fa-solid fa-id-card text-lg"></i>
        </div>
      </header>

      {/* Profile Card */}
      <section className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-soft space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-1000">
           <i className="fa-solid fa-fingerprint text-8xl"></i>
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700 shadow-inner overflow-hidden">
             <img src={BITFITNESS_LOGO} className="w-10 h-10" alt="Logo" />
          </div>
          <div className="space-y-1">
             <p className="text-[10px] font-black text-bitcoin uppercase tracking-widest">Global Relay ID</p>
             <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 italic truncate max-w-[180px]">{userName}</h3>
          </div>
        </div>

        <div className="space-y-6 relative z-10 pt-2">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Identifier</label>
            <input 
              type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 focus:border-bitcoin outline-none font-bold text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Lightning Address</label>
            <input 
              type="email" value={editLnAddr} onChange={(e) => setEditLnAddr(e.target.value)}
              placeholder="user@blink.sv"
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 focus:border-bitcoin outline-none font-mono text-[11px] transition-all"
            />
          </div>

          <button 
            onClick={handleSaveProfile}
            disabled={!hasUnsavedChanges || isSyncing}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-bitcoin transition-all btn-press flex items-center justify-center gap-2 ${
              !hasUnsavedChanges || isSyncing ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700' : 'bitcoin-gradient text-white'
            }`}
          >
            {isSyncing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-sync"></i>}
            {isSyncing ? 'Syncing...' : 'Propagate Update'}
          </button>
        </div>
      </section>

      {/* Toggles */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Node Operations</h3>
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 shadow-soft">
          <button onClick={() => {onToggleTheme(); haptic(20);}} className="w-full p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-bitcoin">
                <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
              </div>
              <div>
                <span className="block font-bold text-[13px]">Dark Mode</span>
                <span className="block text-[10px] text-zinc-400 font-medium">Battery optimization</span>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-bitcoin' : 'bg-zinc-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>
          
          <button onClick={() => {onToggleOracle(); haptic(20);}} className="w-full p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-bitcoin">
                <i className="fa-solid fa-microchip"></i>
              </div>
              <div>
                <span className="block font-bold text-[13px]">AI Validator</span>
                <span className="block text-[10px] text-zinc-400 font-medium">Auto-verification</span>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${aiOracleEnabled ? 'bg-bitcoin' : 'bg-zinc-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${aiOracleEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>

          <button onClick={() => {onOpenValidator(); haptic(20);}} className="w-full p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-bitcoin">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <span className="block font-bold text-[13px] text-bitcoin">Validator Station</span>
                <span className="block text-[10px] text-zinc-400 font-medium">Audit mempool & settle</span>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-zinc-300 text-xs"></i>
          </button>
        </div>
      </section>

      {/* Critical Actions */}
      <section className="space-y-4 pt-4">
        <button 
          onClick={() => {if(confirm("Confirm hard reset?")) { onClearData(); haptic([200, 100, 200]); }}}
          className="w-full p-6 bg-red-50 dark:bg-red-500/10 rounded-[2rem] border border-red-100 dark:border-red-500/20 flex items-center justify-between group transition-all active:scale-95"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <i className="fa-solid fa-trash-can"></i>
            </div>
            <div className="text-left">
               <span className="block font-bold text-[13px] text-red-600 dark:text-red-400">Hard Reset</span>
               <span className="block text-[10px] text-red-400/60 font-medium">Delete all chain data</span>
            </div>
          </div>
          <i className="fa-solid fa-triangle-exclamation text-red-300 group-hover:text-red-500 transition-colors"></i>
        </button>
      </section>
    </div>
  );
};

export default Settings;
