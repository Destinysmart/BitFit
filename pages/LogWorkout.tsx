
import React, { useState, useRef, useEffect } from 'react';
import { EXERCISES, EXERCISE_VISUALS, EXERCISE_TIPS } from '../constants';
import { Workout, VerificationStatus } from '../types';

interface LogWorkoutProps {
  onSave: (workout: Workout) => void;
  onCancel: () => void;
  onHeaderUpdate?: (title: string) => void;
  alreadyMinedToday?: boolean;
  lastWorkout?: Workout | null;
}

const LogWorkout: React.FC<LogWorkoutProps> = ({ onSave, onCancel, onHeaderUpdate, lastWorkout }) => {
  const [step, setStep] = useState<'form' | 'summary'>('form');
  const [exercise, setExercise] = useState(EXERCISES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [reps, setReps] = useState<string>('10');
  const [sets, setSets] = useState<string>('3');
  const [duration, setDuration] = useState<string>('');
  const [signalBroadcasted, setSignalBroadcasted] = useState(false);
  const [xLink, setXLink] = useState('');
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTimeBased = exercise.toLowerCase().includes('run') || exercise.toLowerCase().includes('plank');
  const durationUnit = exercise.toLowerCase().includes('run') ? 'Minutes' : 'Seconds';

  const filteredExercises = EXERCISES.filter(ex => 
    ex.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (onHeaderUpdate) {
      if (lastWorkout) {
        onHeaderUpdate('Protocol Confirmed');
      } else {
        onHeaderUpdate(step === 'summary' ? 'Review & Sign' : 'New Computation');
      }
    }
  }, [step, onHeaderUpdate, lastWorkout]);

  const hapticFeedback = (pattern: number | number[]) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoProof(reader.result as string);
        hapticFeedback([40, 20]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBroadcastSignal = () => {
    const text = `Computing block on BitFitness: ${reps} reps of ${exercise} x ${sets} sets. \n\n#ProofOfWork #Bitcoin 🟠💪`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSignalBroadcasted(true);
    hapticFeedback(60);
  };

  const handleGoToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signalBroadcasted) {
      alert("Verification Error: You must spread the signal on X to generate social consensus.");
      return;
    }
    setStep('summary');
    hapticFeedback(30);
  };

  const handleFinalSave = () => {
    if (!xLink.includes('x.com') && !xLink.includes('twitter.com')) {
      setValidationError("Please provide a valid X/Twitter status URL.");
      hapticFeedback([80, 40, 80]);
      return;
    }
    
    setIsBroadcasting(true);
    hapticFeedback([30, 30]);
    
    setTimeout(() => {
      const newWorkout: Workout = {
        id: crypto.randomUUID(),
        exercise,
        reps: parseInt(reps),
        sets: parseInt(sets),
        duration: duration ? parseInt(duration) : undefined,
        timestamp: Date.now(),
        xProofUrl: xLink,
        photo: photoProof || undefined,
        powVerified: true,
        verificationStatus: 'pending', 
        aiReason: "Entry submitted to mempool. Nodes are verifying the work.",
      };
      onSave(newWorkout);
      setIsBroadcasting(false);
      hapticFeedback(150);
    }, 1200);
  };

  if (lastWorkout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-enter">
        <div className="w-24 h-24 bitcoin-gradient rounded-[2.5rem] flex items-center justify-center shadow-bitcoin animate-float">
          <i className="fa-solid fa-check text-white text-4xl"></i>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Block Mined</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Entry added to local chain</p>
        </div>
        <button 
          onClick={onCancel} 
          className="w-full max-w-xs py-5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-2xl font-black uppercase text-sm tracking-widest shadow-hard btn-press"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="page-transition pb-20">
      {step === 'form' ? (
        <form onSubmit={handleGoToSummary} className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Choose Protocol</label>
              <div className="group relative">
                <button type="button" className="text-zinc-300 dark:text-zinc-600 hover:text-bitcoin dark:hover:text-bitcoin transition-colors focus:outline-none">
                  <i className="fa-solid fa-circle-info text-sm"></i>
                </button>
                <div className="absolute bottom-full right-0 mb-3 w-56 p-4 bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl shadow-hard opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 pointer-events-none z-50 border border-white/10 translate-y-2 group-hover:translate-y-0">
                  <div className="relative">
                    <span className="block text-[9px] font-black text-bitcoin uppercase tracking-widest mb-1.5">Form Specification</span>
                    <p className="text-[11px] font-medium leading-relaxed opacity-90">
                      {EXERCISE_TIPS[exercise] || "Maintain a steady rhythm and full range of motion for maximum efficiency."}
                    </p>
                    <div className="absolute top-full right-1.5 w-2 h-2 bg-zinc-900 dark:bg-zinc-800 border-r border-b border-white/10 rotate-45 -mt-1"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
               <select 
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="w-full p-5 pl-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl font-bold text-lg appearance-none shadow-soft transition-all focus:border-bitcoin"
              >
                {EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs"></i>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 px-1">Reps</label>
              <input 
                type="number" value={reps} onChange={e => setReps(e.target.value)}
                className="w-full p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl font-black text-3xl text-center shadow-soft focus:border-bitcoin"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 px-1">Sets</label>
              <input 
                type="number" value={sets} onChange={e => setSets(e.target.value)}
                className="w-full p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl font-black text-3xl text-center shadow-soft focus:border-bitcoin"
              />
            </div>
          </div>

          {isTimeBased && (
             <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 px-1">{durationUnit}</label>
              <input 
                type="number" value={duration} placeholder="0" onChange={e => setDuration(e.target.value)}
                className="w-full p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl font-black text-2xl text-center shadow-soft focus:border-bitcoin"
              />
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 px-1">Proof Generation</label>
            <div className="bg-zinc-100 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-bitcoin/10 flex items-center justify-center text-bitcoin">
                   <i className="fa-brands fa-x-twitter"></i>
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Social Consensus</p>
                   <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">Generate a public hash of your work.</p>
                 </div>
                 {signalBroadcasted && <i className="fa-solid fa-circle-check text-green-500"></i>}
               </div>
               <button 
                type="button" onClick={handleBroadcastSignal}
                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                  signalBroadcasted ? 'bg-bitcoin text-white shadow-bitcoin' : 'bg-zinc-950 text-white dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {signalBroadcasted ? 'Signal Broadcasted' : 'Generate X Signal'}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className={`w-full py-6 rounded-3xl font-black uppercase text-sm tracking-widest shadow-bitcoin transition-all btn-press ${
                !signalBroadcasted ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800' : 'bitcoin-gradient text-white'
              }`}
            >
              Continue to Sign
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8 animate-enter">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black italic uppercase">Review Block</h3>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Digital Signature Required</p>
          </div>

          <div className="p-8 bg-zinc-950 text-white rounded-[2.5rem] shadow-hard bitcoin-glow space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Operation</span>
              <span className="text-xl font-black italic uppercase text-bitcoin">{exercise}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <span className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Compute</span>
                 <span className="text-lg font-black">{reps} Reps</span>
               </div>
               <div>
                 <span className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Integrity</span>
                 <span className="text-lg font-black">{sets} Sets</span>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 px-1">Social Endpoint</label>
            <input 
              type="url" value={xLink} onChange={e => setXLink(e.target.value)}
              placeholder="Link to your X post..."
              className={`w-full p-5 bg-white dark:bg-zinc-900 border-2 rounded-3xl font-medium text-xs shadow-soft transition-all focus:border-bitcoin ${
                validationError ? 'border-red-500' : 'border-zinc-100 dark:border-zinc-800'
              }`}
            />
            {validationError && <p className="text-[10px] font-bold text-red-500 px-2 uppercase">{validationError}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleFinalSave}
              disabled={isBroadcasting}
              className="w-full py-6 bitcoin-gradient text-white rounded-3xl font-black uppercase text-sm tracking-widest shadow-bitcoin btn-press flex items-center justify-center gap-2"
            >
              {isBroadcasting ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-signature"></i>}
              {isBroadcasting ? 'Broadcasting...' : 'Sign & Broadcast'}
            </button>
            <button 
              onClick={() => setStep('form')}
              className="w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Back to Computation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogWorkout;
