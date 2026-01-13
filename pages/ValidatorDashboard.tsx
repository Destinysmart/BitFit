
import React, { useRef, useMemo, useState } from 'react';
import { Workout, VerificationStatus } from '../types';

interface ValidatorDashboardProps {
  workouts: Workout[];
  onUpdateStatus: (id: string, status: VerificationStatus, reason?: string) => void;
  onImport: (workouts: Workout[]) => void;
  onBack: () => void;
}

const ValidatorDashboard: React.FC<ValidatorDashboardProps> = ({ workouts, onUpdateStatus, onImport, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validatorNotes, setValidatorNotes] = useState<Record<string, string>>({});

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          // Handle both direct arrays or wrapped { workouts: [] } objects
          const logs = imported.workouts || (Array.isArray(imported) ? imported : null);
          if (logs) {
            onImport(logs);
            alert("Logs imported successfully!");
          } else {
            alert("No workout logs found in file.");
          }
        } catch (err) {
          alert("Invalid JSON format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleNoteChange = (id: string, note: string) => {
    setValidatorNotes(prev => ({ ...prev, [id]: note }));
  };

  const pendingCount = useMemo(() => workouts.filter(w => w.verificationStatus === 'pending').length, [workouts]);
  const flaggedCount = useMemo(() => workouts.filter(w => w.verificationStatus === 'flagged').length, [workouts]);

  const reviewQueue = useMemo(() => 
    workouts.filter(w => w.verificationStatus === 'pending' || w.verificationStatus === 'flagged'),
  [workouts]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 pt-2">
      <div className="bg-bitcoin/5 p-5 rounded-3xl border-2 border-bitcoin/20 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-bitcoin flex items-center gap-2">
            <i className="fa-solid fa-network-wired"></i>
            Protocol Control
          </h3>
          <span className="text-[8px] font-mono text-bitcoin/60 uppercase">Manual Override Active</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mb-4">
          Verify peer evidence or resolve AI Oracle flags. Confirmed blocks are locked into the ledger and can affect streak stats.
        </p>
        <div className="relative group/tooltip">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-bitcoin text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-bitcoin-dark active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-file-import"></i>
            Import Participant Logs
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
            <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
              Load external block data
            </div>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
           <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Mempool</div>
           <div className="flex items-end gap-1">
             <div className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{pendingCount}</div>
             <div className="text-[10px] font-bold text-zinc-400 uppercase">Pending</div>
           </div>
        </div>
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
           <div className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Alerts</div>
           <div className="flex items-end gap-1">
             <div className="text-2xl font-black text-red-500 leading-none">{flaggedCount}</div>
             <div className="text-[10px] font-bold text-red-400 uppercase">Flagged</div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Unconfirmed Block Queue</h3>
          <span className="text-[9px] font-bold text-zinc-400 uppercase">{reviewQueue.length} Tasks</span>
        </div>

        {reviewQueue.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <i className="fa-solid fa-check-double text-4xl text-zinc-200 dark:text-zinc-800 mb-4"></i>
            <p className="text-xs font-black uppercase text-zinc-400">Mempool is clear.</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2">All blocks are confirmed or rejected.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewQueue.map(w => (
              <div key={w.id} className={`p-4 rounded-2xl border-2 transition-all animate-in slide-in-from-bottom-2 duration-300 ${
                w.verificationStatus === 'flagged' ? 'border-red-500/20 bg-red-500/5' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm'
              }`}>
                <div className="flex gap-4">
                  <div className="relative">
                    {w.photo ? (
                      <img src={w.photo} className="w-24 h-24 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm" alt="Evidence" />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center text-zinc-400">
                        <i className="fa-solid fa-image-slash text-xl mb-1"></i>
                        <span className="text-[8px] font-black uppercase">No Photo</span>
                      </div>
                    )}
                    {w.aiConfidence !== undefined && (
                      <div className={`absolute -top-2 -left-2 px-1.5 py-0.5 rounded text-[8px] font-black border uppercase shadow-sm ${
                        w.aiConfidence > 80 ? 'bg-green-500 border-green-600 text-white' : 'bg-yellow-500 border-yellow-600 text-white'
                      }`}>
                        {w.aiConfidence}% AI
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded inline-block w-fit mb-1 ${
                          w.isImported ? 'bg-bitcoin/10 text-bitcoin' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                          {w.isImported ? `NODE: ${w.participantName || 'EXTERNAL'}` : 'LOCAL NODE'}
                        </span>
                        <h4 className="font-black uppercase text-sm text-zinc-900 dark:text-white tracking-tight truncate">{w.exercise}</h4>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-tighter">{w.reps} Reps • {w.sets} Sets</p>
                      </div>
                      <div className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        w.verificationStatus === 'flagged' ? 'bg-red-500 text-white' : 'bg-zinc-500 text-white'
                      }`}>
                        {w.verificationStatus}
                      </div>
                    </div>
                    
                    {w.aiReason && (
                      <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-[10px] text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700 leading-tight">
                        <span className="font-black text-bitcoin uppercase mr-1">Oracle:</span>
                        {w.aiReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 px-1">Validator Note (Optional)</label>
                    <textarea 
                      value={validatorNotes[w.id] || ''}
                      onChange={(e) => handleNoteChange(w.id, e.target.value)}
                      placeholder="Add manual context (e.g. 'Evidence is valid', 'Incomplete rep count')..."
                      className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:border-bitcoin focus:ring-1 focus:ring-bitcoin outline-none text-[10px] font-medium text-zinc-700 dark:text-zinc-300 transition-all resize-none min-h-[60px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 relative group/tooltip">
                      <button 
                        onClick={() => onUpdateStatus(w.id, 'verified', validatorNotes[w.id])}
                        className="w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-bitcoin dark:hover:bg-bitcoin dark:hover:text-white"
                      >
                        <i className="fa-solid fa-check"></i>
                        Confirm
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
                        <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                          Approve block
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 relative group/tooltip">
                      <button 
                        onClick={() => onUpdateStatus(w.id, 'flagged', validatorNotes[w.id])}
                        disabled={w.verificationStatus === 'flagged' && validatorNotes[w.id] === w.validatorReason}
                        className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                          w.verificationStatus === 'flagged' && validatorNotes[w.id] === w.validatorReason
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-ban"></i>
                        Flag
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
                        <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                          Mark as suspicious
                        </div>
                      </div>
                    </div>

                    <div className="relative group/tooltip">
                      <button 
                        onClick={() => onUpdateStatus(w.id, 'rejected')}
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        aria-label="Reject block"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
                        <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                          Discard transaction
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-[9px] font-black text-zinc-500 uppercase tracking-widest pt-4">
        Validator Nodes maintain network integrity. <br/> Fix the body, fix the protocol.
      </p>
    </div>
  );
};

export default ValidatorDashboard;
