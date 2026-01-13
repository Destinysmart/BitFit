
import React from 'react';
import { AppState } from '../types';
import { BITFITNESS_LOGO } from '../constants';

interface SettingsProps {
  state: AppState;
  onToggleTheme: () => void;
  onToggleOracle: () => void;
  onClearData: () => void;
  onExport: () => void;
  onOpenValidator: () => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onToggleTheme, onToggleOracle, onClearData, onExport, onOpenValidator }) => {
  const { theme, aiOracleEnabled, userName } = state;

  const handleConnectWallet = () => {
    alert("Blink Wallet Integration: Coming soon to mainnet. Prepare your lightning address for PoW payouts.");
  };

  const handleExportData = () => {
    try {
      const exportData = { ...state, exportDate: new Date().toISOString(), version: "3.0" };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bitfitness_node_backup.json`;
      link.click();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Settings</h2>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Local Node Protocol</p>
        </div>
        <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-bitcoin shadow-xl">
           <i className="fa-solid fa-code text-xl"></i>
        </div>
      </header>

      {/* User Profile */}
      <section className="bg-white dark:bg-zinc-900 p-8 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700">
           <img src={BITFITNESS_LOGO} className="w-12 h-12 rounded-2xl" />
        </div>
        <div className="space-y-1">
           <p className="text-[10px] font-black text-bitcoin uppercase tracking-widest">Active Node Identifier</p>
           <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic">{userName}</h3>
           <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
             Mainnet Synced
           </div>
        </div>
      </section>

      {/* Lightning Integration */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Money Protocol</h3>
        <div className="relative group">
          <button 
            onClick={handleConnectWallet}
            className="w-full bg-zinc-950 text-white p-8 rounded-4xl flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group/btn"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center text-bitcoin group-hover/btn:scale-110 transition-transform">
                <i className="fa-solid fa-bolt-lightning text-2xl"></i>
              </div>
              <div className="text-left">
                <span className="block text-lg font-black italic uppercase leading-none mb-1">Blink Wallet</span>
                <span className="block text-[10px] opacity-50 uppercase font-black tracking-widest">Connect for PoW Payouts</span>
              </div>
            </div>
            <i className="fa-solid fa-plus text-zinc-700"></i>
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
              Link Lightning wallet for rewards
            </div>
          </div>
        </div>
      </section>

      {/* Toggles */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 px-1">System</h3>
        <div className="bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 shadow-sm">
          <div className="relative group">
            <button onClick={onToggleTheme} className="w-full p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-bitcoin">
                  <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
                </div>
                <span className="font-black uppercase text-xs tracking-widest text-zinc-900 dark:text-white">Dark Protocol</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${theme === 'dark' ? 'bg-bitcoin' : 'bg-zinc-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
              </div>
            </button>
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                Switch interface theme
              </div>
            </div>
          </div>

          <div className="relative group">
            <button onClick={onToggleOracle} className="w-full p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-bitcoin">
                  <i className="fa-solid fa-microchip"></i>
                </div>
                <div className="text-left">
                  <span className="block font-black uppercase text-xs tracking-widest text-zinc-900 dark:text-white">AI PoW Oracle</span>
                  <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Automatic Visual Verification</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${aiOracleEnabled ? 'bg-bitcoin' : 'bg-zinc-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${aiOracleEnabled ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
              </div>
            </button>
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                Enable AI visual verification
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Validator Dashboard Link */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Consensus</h3>
        <div className="relative group">
          <button 
            onClick={onOpenValidator}
            className="w-full bg-white dark:bg-zinc-900 p-6 rounded-4xl flex items-center justify-between shadow-sm border border-zinc-100 dark:border-zinc-800 hover:border-bitcoin transition-all group/btn"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-bitcoin/10 rounded-2xl flex items-center justify-center text-bitcoin">
                <i className="fa-solid fa-shield-check"></i>
              </div>
              <div className="text-left">
                <span className="block font-black uppercase text-xs tracking-widest text-zinc-900 dark:text-white">Validator Station</span>
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Review Participant Mempool</span>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-zinc-300 group-hover/btn:translate-x-1 transition-transform"></i>
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
              Review pending network blocks
            </div>
          </div>
        </div>
      </section>

      {/* Ledger Actions */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Ledger</h3>
        <div className="bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 shadow-sm">
          <button onClick={handleExportData} className="w-full p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-file-export w-5"></i>
              <span className="font-black uppercase text-xs tracking-widest">Export Node State</span>
            </div>
          </button>
          <button onClick={onClearData} className="w-full p-6 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-red-500">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-trash-can w-5"></i>
              <span className="font-black uppercase text-xs tracking-widest">Hard Reset Chain</span>
            </div>
          </button>
        </div>
      </section>

      <footer className="text-center pt-8 pb-12 space-y-4 opacity-50">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Stack Reps. Stack Sats.</p>
        <div className="flex justify-center gap-6 text-xl">
           <i className="fa-brands fa-github text-zinc-400 hover:text-bitcoin transition-colors"></i>
           <i className="fa-brands fa-x-twitter text-zinc-400 hover:text-bitcoin transition-colors"></i>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
