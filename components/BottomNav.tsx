
import React from 'react';
import { Page } from '../types';

interface BottomNavProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ current, onNavigate }) => {
  const items: { id: Page; icon: string; label: string }[] = [
    { id: 'home', icon: 'fa-house', label: 'Nodes' },
    { id: 'network', icon: 'fa-tower-broadcast', label: 'Relay' },
    { id: 'challenges', icon: 'fa-bolt', label: 'Quests' },
    { id: 'progress', icon: 'fa-chart-pie', label: 'Ledger' },
    { id: 'settings', icon: 'fa-user-gear', label: 'Node' },
  ];

  const getParentTab = (id: Page): Page => {
    if (id === 'validator') return 'settings';
    if (id === 'log') return 'home';
    return id;
  };

  const activeParent = getParentTab(current);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-6 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 via-zinc-50/90 dark:via-zinc-950/90 to-transparent pointer-events-none">
      <nav className="max-w-md mx-auto glass border border-white/40 dark:border-white/5 flex justify-between items-center p-1.5 shadow-hard rounded-[2.5rem] pointer-events-auto">
        {items.map(item => {
          const isActive = activeParent === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative group flex flex-col items-center justify-center flex-1 py-3 px-1 rounded-3xl transition-all duration-300"
            >
              <div className={`relative z-10 flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-bitcoin -translate-y-1' : 'text-zinc-400 dark:text-zinc-600'}`}>
                <i className={`fa-solid ${item.icon} text-lg transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}></i>
                <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
              </div>
              
              {isActive && (
                <div className="absolute inset-0 bg-bitcoin/5 rounded-3xl border border-bitcoin/10 scale-95 animate-in fade-in zoom-in duration-500"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
