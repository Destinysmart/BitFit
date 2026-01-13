
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { EXERCISES } from '../constants';
import { Workout, VerificationStatus } from '../types';

interface LogWorkoutProps {
  onSave: (workout: Workout) => void;
  onCancel: () => void;
  onHeaderUpdate?: (title: string) => void;
  alreadyMinedToday?: boolean;
  lastWorkout?: Workout | null;
}

const LogWorkout: React.FC<LogWorkoutProps> = ({ onSave, onCancel, onHeaderUpdate, alreadyMinedToday = false, lastWorkout }) => {
  const [step, setStep] = useState<'form' | 'summary'>('form');
  const [exercise, setExercise] = useState(EXERCISES[0]);
  const [reps, setReps] = useState<string>('10');
  const [sets, setSets] = useState<string>('3');
  const [duration, setDuration] = useState<string>('');
  const [powVerified, setPowVerified] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isOracleVerifying, setIsOracleVerifying] = useState(false);
  const [oracleResult, setOracleResult] = useState<{ status: VerificationStatus; reason: string; confidence: number } | null>(null);
  const [errors, setErrors] = useState<{ reps?: string; sets?: string; pow?: string; duration?: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const repsRef = useRef<HTMLInputElement>(null);
  const setsRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);

  const isTimeBased = exercise.toLowerCase().includes('run') || exercise.toLowerCase().includes('plank');
  const durationUnit = exercise.toLowerCase().includes('run') ? 'Minutes' : 'Seconds';

  useEffect(() => {
    if (onHeaderUpdate) {
      if (lastWorkout) {
        onHeaderUpdate('Block Confirmed');
      } else {
        onHeaderUpdate(step === 'summary' ? 'Block Review' : 'Log Computation');
      }
    }
  }, [step, onHeaderUpdate, lastWorkout]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setOracleResult(null); 
        setPowVerified(false);
        setErrors(prev => ({ ...prev, pow: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const runLocalOracle = async (): Promise<{ status: VerificationStatus; reason: string; confidence: number }> => {
    if (!photo) return { status: 'pending', reason: "No evidence found.", confidence: 0 };

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = photo.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: `Oracle analysis: User claims ${reps} reps of ${exercise}. Determine if this is genuine workout evidence. High confidence (>90) required for auto-verification. Output JSON.` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verified: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER, description: "0-100" },
              reason: { type: Type.STRING }
            },
            required: ["verified", "confidence", "reason"]
          }
        }
      });

      const result = JSON.parse(response.text);
      const status: VerificationStatus = (result.verified && result.confidence > 90) ? 'verified' : (result.verified ? 'pending' : 'flagged');
      
      return { status, reason: result.reason, confidence: result.confidence };
    } catch (error) {
      console.error("Consensus Error:", error);
      return { status: 'pending', reason: "Network latency - verify manually.", confidence: 0 };
    }
  };

  const validate = () => {
    const newErrors: { reps?: string; sets?: string; pow?: string; duration?: string } = {};
    const repsNum = parseInt(reps);
    const setsNum = parseInt(sets);
    const durationNum = duration ? parseInt(duration) : 0;

    if (isNaN(repsNum) || repsNum <= 0) newErrors.reps = "Required";
    if (isNaN(setsNum) || setsNum <= 0) newErrors.sets = "Required";
    if (duration && (isNaN(durationNum) || durationNum <= 0)) newErrors.duration = "Invalid";
    
    if (!powVerified && !photo) newErrors.pow = "Attestation Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoToSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (photo && !oracleResult) {
      setIsOracleVerifying(true);
      const result = await runLocalOracle();
      setOracleResult(result);
      setIsOracleVerifying(false);

      if (result.status === 'verified' && result.confidence > 90) {
        setPowVerified(true);
      } else if (result.status === 'flagged') {
         setErrors(prev => ({...prev, pow: "Oracle flagged evidence. Manual check required."}));
         return; 
      }
    }
    
    setStep('summary');
  };

  const handleFinalSave = () => {
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      exercise,
      reps: parseInt(reps),
      sets: parseInt(sets),
      duration: duration ? parseInt(duration) : undefined,
      timestamp: Date.now(),
      powVerified: powVerified,
      verificationStatus: oracleResult?.status || 'pending',
      aiReason: oracleResult?.reason,
      aiConfidence: oracleResult?.confidence,
      photo: photo || undefined
    };
    onSave(newWorkout);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      } else {
        handleGoToSummary(e as unknown as React.FormEvent);
      }
    }
  };

  // SUCCESS STEP: Displayed after App.tsx sets lastLoggedWorkout
  if (lastWorkout) {
    return (
      <div className="space-y-10 animate-in zoom-in-95 fade-in duration-500 pb-32 pt-4">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-28 h-28 bitcoin-gradient rounded-[40px] flex items-center justify-center border-8 border-white dark:border-zinc-800 shadow-[0_20px_60px_-15px_rgba(247,147,26,0.6)] animate-float">
            <i className="fa-solid fa-check text-white text-5xl"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 leading-none">Block Confirmed</h2>
            <p className="text-[11px] font-black text-bitcoin bg-bitcoin/10 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] inline-block border border-bitcoin/20">
              HASH: {lastWorkout.id.slice(0, 12)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[48px] p-8 border border-zinc-100 dark:border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform group-hover:scale-125 duration-1000">
             <i className="fa-solid fa-cube text-9xl rotate-12"></i>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-bitcoin shadow-xl">
                 <i className="fa-solid fa-bolt-lightning text-2xl"></i>
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] block mb-1">Mined Operation</span>
                <h3 className="text-2xl font-black uppercase text-zinc-900 dark:text-white leading-none tracking-tight">{lastWorkout.exercise}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-white/5">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Total Reps</span>
                <div className="text-3xl font-black text-zinc-900 dark:text-white flex items-baseline gap-1">
                  {lastWorkout.reps}
                  <span className="text-xs text-bitcoin font-black italic">R</span>
                </div>
              </div>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-white/5">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Clusters</span>
                <div className="text-3xl font-black text-zinc-900 dark:text-white flex items-baseline gap-1">
                  {lastWorkout.sets}
                  <span className="text-xs text-bitcoin font-black italic">S</span>
                </div>
              </div>
              {lastWorkout.duration && (
                <div className="col-span-2 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-white/5 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Duration Profile</span>
                  <div className="text-xl font-black text-zinc-900 dark:text-white">
                    {lastWorkout.duration} <span className="text-[10px] uppercase opacity-50">{lastWorkout.exercise.toLowerCase().includes('run') ? 'Minutes' : 'Seconds'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 p-5 bg-green-500/5 border-2 border-green-500/20 rounded-[28px] text-green-500">
               <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg">
                 <i className="fa-solid fa-certificate"></i>
               </div>
               <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest block">Ledger Sync Complete</span>
                  <p className="text-[9px] font-bold opacity-60 uppercase">Immutable proof added to participant node</p>
               </div>
            </div>
          </div>
        </div>

        <div className="relative group/tooltip">
          <button 
            onClick={onCancel}
            className="w-full py-7 bitcoin-gradient text-white rounded-[32px] font-black uppercase tracking-widest shadow-2xl shadow-bitcoin/30 active:scale-[0.98] hover:scale-[1.01] transition-all text-lg flex items-center justify-center gap-3"
          >
            Return to Dashboard
            <i className="fa-solid fa-arrow-right text-sm"></i>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
            <div className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap">
              Go back home
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    return (
      <div className="space-y-10 animate-in zoom-in-95 fade-in duration-500 pb-32">
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          <div className="w-24 h-24 bitcoin-gradient rounded-[32px] flex items-center justify-center border-4 border-white dark:border-zinc-800 shadow-2xl bitcoin-glow rotate-6">
            <i className="fa-solid fa-cube text-white text-4xl"></i>
          </div>
          <div className="space-y-1">
             <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Transaction ID: {crypto.randomUUID().slice(0, 8)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 border border-zinc-100 dark:border-white/5 space-y-10 shadow-2xl">
          <div className="flex items-center gap-5 pb-6 border-b border-zinc-100 dark:border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-inner">
               <i className="fa-solid fa-bolt-lightning text-bitcoin text-2xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 block">PROTOCOL OP</span>
              <h3 className="text-2xl font-extrabold uppercase text-zinc-900 dark:text-white truncate tracking-tight">{exercise}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Volume</span>
              <div className="text-3xl font-black text-zinc-900 dark:text-white">{reps}<span className="text-xs font-bold text-bitcoin ml-1 italic tracking-normal">R</span></div>
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Clusters</span>
              <div className="text-3xl font-black text-zinc-900 dark:text-white">{sets}<span className="text-xs font-bold text-bitcoin ml-1 italic tracking-normal">S</span></div>
            </div>
          </div>

          {photo && (
            <div className="rounded-[32px] border-4 border-white dark:border-zinc-800 overflow-hidden shadow-2xl h-56 relative group">
              <img src={photo} alt="Proof" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              {oracleResult && (
                 <div className="absolute inset-x-4 bottom-4 glass dark:bg-zinc-900/80 p-3 rounded-2xl border border-white/20 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${oracleResult.status === 'verified' ? 'bg-green-500' : oracleResult.status === 'pending' ? 'bg-bitcoin' : 'bg-red-500'} animate-pulse`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                        {oracleResult.status === 'pending' ? 'Verification Pending' : `Oracle: ${oracleResult.confidence}%`}
                      </span>
                    </div>
                    <i className={`fa-solid ${oracleResult.status === 'verified' ? 'fa-check-circle text-green-500' : 'fa-shield-halved text-bitcoin'}`}></i>
                 </div>
              )}
            </div>
          )}

          <div className={`flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all duration-500 ${
            powVerified ? 'text-green-500 bg-green-500/5 border-green-500/20' : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${powVerified ? 'bg-green-500 text-white shadow-lg' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'}`}>
              <i className={`fa-solid ${powVerified ? 'fa-check-double' : 'fa-circle-question'}`}></i>
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest block">Signature Protocol</span>
              <p className="text-[10px] font-bold opacity-60 uppercase">{powVerified ? 'Proof-of-Work Validated' : 'Awaiting Confirmation'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative group/tooltip">
            <button 
              onClick={handleFinalSave}
              aria-label="Broadcast block to the network"
              className="w-full py-7 bitcoin-gradient text-white rounded-[28px] font-black uppercase tracking-widest shadow-2xl shadow-bitcoin/30 active:scale-[0.98] hover:scale-[1.01] transition-all flex items-center justify-center gap-3 text-lg"
            >
              <i className="fa-solid fa-tower-broadcast animate-pulse"></i>
              Broadcast Block
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
              <div className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap">
                Sync with local ledger
              </div>
            </div>
          </div>
          
          <div className="relative group/tooltip">
            <button 
              onClick={() => setStep('form')}
              className="w-full py-4 text-zinc-400 dark:text-zinc-500 hover:text-bitcoin font-black uppercase text-[11px] tracking-[0.3em] transition-colors"
            >
              Adjust Parameters
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
              <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                Edit workout details
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-32 pt-2">
      <form onSubmit={handleGoToSummary} className="space-y-8">
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Operation Type</label>
          <div className="relative group/tooltip">
            <select 
              value={exercise}
              disabled={isOracleVerifying}
              onChange={(e) => setExercise(e.target.value)}
              className="w-full p-6 rounded-[28px] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-bitcoin outline-none font-extrabold text-lg appearance-none transition-all shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 disabled:opacity-50 cursor-pointer"
            >
              {EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-bitcoin">
              <i className="fa-solid fa-chevron-down text-sm"></i>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
              <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                Choose exercise type
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Reps</label>
            <div className="relative group/tooltip">
              <input 
                ref={repsRef}
                type="number"
                inputMode="numeric"
                value={reps}
                disabled={isOracleVerifying}
                onChange={(e) => setReps(e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, setsRef)}
                className="w-full p-7 rounded-[28px] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-bitcoin outline-none font-black text-3xl transition-all shadow-sm text-center focus:scale-105"
              />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
                <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                  Enter number of repetitions
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Sets</label>
            <div className="relative group/tooltip">
              <input 
                ref={setsRef}
                type="number"
                inputMode="numeric"
                value={sets}
                disabled={isOracleVerifying}
                onChange={(e) => setSets(e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, isTimeBased ? durationRef : undefined)}
                className="w-full p-7 rounded-[28px] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-bitcoin outline-none font-black text-3xl transition-all shadow-sm text-center focus:scale-105"
              />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
                <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                  Enter number of sets
                </div>
              </div>
            </div>
          </div>
        </div>

        {isTimeBased && (
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">{durationUnit}</label>
            <div className="relative group/tooltip">
              <input 
                ref={durationRef}
                type="number"
                inputMode="numeric"
                value={duration}
                disabled={isOracleVerifying}
                onChange={(e) => setDuration(e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e)}
                className="w-full p-7 rounded-[28px] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-bitcoin outline-none font-black text-2xl transition-all shadow-sm text-center focus:scale-105"
              />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
                <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                  Enter duration in {durationUnit.toLowerCase()}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Evidence Capture</label>
          <div className="relative group/tooltip">
            <div 
              onClick={() => !isOracleVerifying && fileInputRef.current?.click()}
              className={`w-full h-48 rounded-[36px] bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-bitcoin transition-all shadow-sm overflow-hidden relative group ${isOracleVerifying ? 'cursor-not-allowed border-bitcoin' : ''}`}
            >
              {photo ? (
                <>
                  <img src={photo} alt="Proof" className={`w-full h-full object-cover transition-all duration-700 ${isOracleVerifying ? 'opacity-30 blur-sm' : 'opacity-100 group-hover:scale-110'}`} />
                  {isOracleVerifying && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-md">
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 border-4 border-bitcoin/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-bitcoin border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fa-solid fa-microchip text-bitcoin text-xl animate-pulse"></i>
                        </div>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Synthesizing PoW...</span>
                    </div>
                  )}
                  {!isOracleVerifying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-black uppercase text-[10px] tracking-widest bg-bitcoin px-4 py-2 rounded-full shadow-lg">Change Evidence</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 transition-transform group-hover:scale-110">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-300 dark:text-zinc-600 shadow-inner group-hover:text-bitcoin transition-colors">
                    <i className="fa-solid fa-camera text-2xl"></i>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-black uppercase tracking-widest">Identify Biological Work</span>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
              <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                Upload Proof of Work
              </div>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
        </div>

        <div className="relative group/tooltip">
          <div 
            className={`p-7 rounded-[32px] border-2 transition-all flex items-center gap-6 shadow-sm ${
              powVerified ? 'bg-bitcoin/5 border-bitcoin/50' : errors.pow ? 'bg-red-500/5 border-red-500/50' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
            } ${isOracleVerifying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:border-bitcoin/30'}`}
            onClick={() => {
              if (!isOracleVerifying) setPowVerified(!powVerified);
            }}
          >
            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${powVerified ? 'bg-bitcoin border-bitcoin text-white shadow-xl shadow-bitcoin/20' : 'border-zinc-200 dark:border-zinc-700'}`}>
              {powVerified && <i className="fa-solid fa-check text-base"></i>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm uppercase tracking-tight text-zinc-900 dark:text-white leading-none mb-1">Signed Attestation</div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">
                {oracleResult && oracleResult.status === 'verified' && oracleResult.confidence > 90 
                  ? 'Oracle Signature Validated' 
                  : 'Manual self-verification protocol'}
              </p>
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
            <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
              Attest your Proof of Work
            </div>
          </div>
        </div>

        {errors.pow && (
           <div className="flex items-center gap-2 px-1 text-red-500 animate-in slide-in-from-left-2 duration-300">
             <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
             <p className="text-[10px] font-black uppercase tracking-widest">{errors.pow}</p>
           </div>
        )}

        <div className="relative group/tooltip">
          <button 
            type="submit"
            disabled={isOracleVerifying}
            aria-label="Validate the current block for review"
            className="w-full py-7 bitcoin-gradient text-white rounded-[32px] font-black uppercase tracking-widest shadow-2xl shadow-bitcoin/30 active:scale-[0.98] hover:scale-[1.01] transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isOracleVerifying ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Mining Evidence...
              </>
            ) : (
              'Validate Block'
            )}
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50">
            <div className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap">
              Run local consensus check
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LogWorkout;
