
import React, { useState } from 'react';
import { Challenge, ChallengeCategory, RecurrenceProtocol, ChallengeStatus } from '../types';

interface ChallengesProps {
  challenges: Challenge[];
  onJoin: (id: string) => void;
  onForge: (challenge: Challenge) => void;
  onUpdateStatus: (id: string, status: ChallengeStatus, proof?: string) => void;
  onLogQuestWork: (id: string, proofUrl: string) => void;
  userName: string;
}

const Challenges: React.FC<ChallengesProps> = ({ challenges, onJoin, onForge, onUpdateStatus, onLogQuestWork, userName }) => {
  const [isForging, setIsForging] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState('7');
  const [newCategory, setNewCategory] = useState<ChallengeCategory>('Community');
  const [newReward, setNewReward] = useState('1000');
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceProtocol>('weekly');
  
  const [proofLinks, setProofLinks] = useState<Record<string, string>>({});
  const [payoutLinks, setPayoutLinks] = useState<Record<string, string>>({});
  const [showInput, setShowInput] = useState<Record<string, boolean>>({});
  const [showPayoutInput, setShowPayoutInput] = useState<Record<string, boolean>>({});

  const protocols: RecurrenceProtocol[] = ['once', 'daily', 'weekly', 'monthly'];

  const haptic = (p: number | number[]) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const handleForgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const forged: Challenge = {
      id: 'protocol-' + Math.random().toString(36).substr(2, 9),
      title: newTitle,
      description: newDesc,
      targetDays: parseInt(newTarget),
      currentDays: 0,
      joined: true,
      startDate: Date.now(),
      creatorNode: userName,
      category: newCategory,
      rewardSats: parseInt(newReward),
      recurrence: newRecurrence,
      status: 'active'
    };
    onForge(forged);
    setIsForging(false);
    haptic([50, 30, 50]);
    setNewTitle('');
    setNewDesc('');
  };

  const submitSettlement = (chId: string) => {
    const link = payoutLinks[chId];
    if (!link?.includes('x.com') && !link?.includes('twitter.com')) {
      alert("Validator requires an X link for payout verification.");
      return;
    }
    onUpdateStatus(chId, 'finalizing', link);
    setShowPayoutInput(prev => ({ ...prev, [chId]: false }));
    haptic(150);
  };

  return (
    <div className="space-y-10 pb-32 page-transition">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 leading-none">Global Quests</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Incentive Consensus Layer</p>
        </div>
        <button 
          onClick={() => { setIsForging(true); haptic(20); }}
          className="w-12 h-12 bitcoin-gradient rounded-2xl flex items-center justify-center text-white shadow-bitcoin btn-press transition-all"
        >
          <i className="fa-solid fa-plus text-xl"></i>
        </button>
      </header>

      {isForging && (
        <div className="bg-white dark:bg-zinc-900 rounded-4xl p-8 border border-bitcoin/30 animate-enter shadow-hard relative overflow-hidden">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic mb-6 flex items-center gap-3">
             <i className="fa-solid fa-hammer text-bitcoin"></i>
             Forge Protocol
          </h3>
          <form onSubmit={handleForgeSubmit} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Quest Designation</label>
              <input 
                required value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="Title (e.g. 30 Day Sprint)"
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none focus:border-bitcoin transition-all font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Sats Reward</label>
                <input 
                  type="number" value={newReward} onChange={e => setNewReward(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none focus:border-bitcoin font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Target Days</label>
                <input 
                  type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none focus:border-bitcoin font-bold"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-4 bitcoin-gradient text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-bitcoin btn-press">Deploy Quest</button>
              <button type="button" onClick={() => setIsForging(false)} className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="space-y-6">
        {challenges.map((ch, idx) => {
          const isCreator = ch.creatorNode === userName;
          const statusColors = {
            settled: 'bg-green-500 text-white border-green-500',
            finalizing: 'bg-bitcoin/10 text-bitcoin border-bitcoin/30 animate-pulse',
            active: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700',
            draft: 'bg-zinc-50 text-zinc-300 border-zinc-100'
          };

          return (
            <div key={ch.id} className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-soft transition-all hover:shadow-hard animate-enter" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-bitcoin uppercase tracking-widest bg-bitcoin/10 px-3 py-1 rounded-full border border-bitcoin/20">
                      {ch.rewardSats?.toLocaleString()} SATS
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      {ch.recurrence}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black uppercase text-zinc-900 dark:text-white tracking-tighter leading-tight">{ch.title}</h3>
                </div>
                <div className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border ${statusColors[ch.status]}`}>
                  {ch.status}
                </div>
              </div>
              
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed font-medium">
                {ch.description}
              </p>

              {ch.joined ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Progression</span>
                      <span className="text-xl font-black text-zinc-900 dark:text-white italic">{ch.currentDays}<span className="text-zinc-400 text-sm not-italic ml-1">/{ch.targetDays}</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bitcoin-gradient transition-all duration-1000 shadow-[0_0_8px_rgba(247,147,26,0.3)]" style={{ width: `${(ch.currentDays / ch.targetDays) * 100}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => {
                        const text = `Stacking reps for ${ch.title}! #BitFitness @BitFitness21M`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                        setShowInput(prev => ({ ...prev, [ch.id]: true }));
                        haptic(30);
                      }}
                      className="w-full py-4 bg-zinc-950 dark:bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 btn-press transition-all"
                    >
                      <i className="fa-brands fa-x-twitter"></i>
                      Broadcast Proof
                    </button>

                    {showInput[ch.id] && (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                        <input 
                          type="url" placeholder="Paste X link here..." 
                          value={proofLinks[ch.id] || ''} onChange={e => setProofLinks(prev => ({...prev, [ch.id]: e.target.value}))}
                          className="flex-1 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl text-[10px] font-bold outline-none border-2 border-zinc-100 dark:border-zinc-700 focus:border-bitcoin"
                        />
                        <button onClick={() => { onLogQuestWork(ch.id, proofLinks[ch.id]); setShowInput(prev => ({...prev, [ch.id]: false})); }} className="px-5 bg-bitcoin text-white rounded-2xl font-black uppercase text-[9px] shadow-bitcoin">Commit</button>
                      </div>
                    )}

                    {isCreator && ch.status === 'active' && ch.currentDays >= ch.targetDays && (
                      <button 
                        onClick={() => { setShowPayoutInput(prev => ({ ...prev, [ch.id]: true })); haptic(50); }}
                        className="w-full py-4 bg-bitcoin/10 text-bitcoin border-2 border-dashed border-bitcoin/30 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-bitcoin/20 transition-all flex items-center justify-center gap-2"
                      >
                         <i className="fa-solid fa-sack-dollar"></i>
                         Settle Protocol
                      </button>
                    )}

                    {showPayoutInput[ch.id] && (
                      <div className="p-6 bg-zinc-100 dark:bg-zinc-950 rounded-3xl space-y-4 border border-bitcoin/30 animate-enter">
                         <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block px-1">Payout Proof Link (X)</label>
                         <input 
                           type="url" value={payoutLinks[ch.id] || ''} 
                           onChange={e => setPayoutLinks(prev => ({...prev, [ch.id]: e.target.value}))}
                           className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-xl text-zinc-900 dark:text-white text-[10px] font-bold outline-none focus:border-bitcoin"
                           placeholder="https://x.com/..."
                         />
                         <div className="flex gap-2">
                           <button onClick={() => submitSettlement(ch.id)} className="flex-1 py-3 bitcoin-gradient text-white rounded-xl font-black uppercase text-[9px] shadow-bitcoin">Confirm Payout</button>
                           <button onClick={() => setShowPayoutInput(prev => ({...prev, [ch.id]: false}))} className="px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 rounded-xl font-bold uppercase text-[9px]">Cancel</button>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => { onJoin(ch.id); haptic(50); }}
                  className="w-full py-5 bitcoin-gradient text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-bitcoin btn-press transition-all"
                >
                  Join Quest
                </button>
              )}

              {ch.status === 'settled' && ch.payoutProofUrl && (
                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <i className="fa-solid fa-check-circle text-xs"></i>
                     </div>
                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Protocol Fully Settled</span>
                   </div>
                   <a href={ch.payoutProofUrl} target="_blank" className="text-[9px] font-black text-bitcoin uppercase border-b border-bitcoin/30 hover:border-bitcoin transition-colors">Audit</a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Challenges;
