
import React from 'react';
import { Page } from '../types';

interface BottomNavProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ current, onNavigate }) => {
  const items: { id: Page; icon: string; label: string; tooltip: string }[] = [
    { id: 'home', icon: 'fa-house', label: 'Nodes', tooltip: 'Home Dashboard' },
    { id: 'network', icon: 'fa-tower-broadcast', label: 'Relay', tooltip: 'Global Activity' },
    { id: 'challenges', icon: 'fa-bolt', label: 'Quests', tooltip: 'Active Challenges' },
    { id: 'progress', icon: 'fa-chart-pie', label: 'Ledger', tooltip: 'Your Stats' },
    { id: 'settings', icon: 'fa-user-gear', label: 'Node', tooltip: 'Settings' },
  ];

  // Map subpages to their parent tab for correct highlighting
  const activeTab = (id: Page) => {
    if (id === 'validator') return 'settings';
    if (id === 'log') return 'home'; // Or keep it neutral
    return id;
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none shrink-0">
      <nav className="max-w-md mx-auto glass border border-white/30 dark:border-white/5 flex justify-between items-center p-2.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-[32px] pointer-events-auto">
        {items.map(item => {
          const isActive = activeTab(current) === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative group flex flex-col items-center justify-center flex-1 py-3 px-1 rounded-3xl transition-all duration-300"
            >
              <div className={`relative z-10 flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-bitcoin -translate-y-0.5 scale-110' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>
                <i className={`fa-solid ${item.icon} text-lg transition-transform duration-300 ${isActive ? 'tab-active-glow' : ''}`}></i>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
              </div>
              
              {isActive && (
                <div className="absolute inset-0 bg-bitcoin/10 rounded-[24px] border border-bitcoin/20 scale-95 animate-in fade-in zoom-in duration-500"></div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full mb-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                  {item.tooltip}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
