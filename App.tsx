
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Page, AppState, Workout, Challenge, UserStats, VerificationStatus } from './types';
import { INITIAL_CHALLENGES, BITFITNESS_LOGO } from './constants';
import { RelayService } from './services/relay';
import Home from './pages/Home';
import LogWorkout from './pages/LogWorkout';
import Challenges from './pages/Challenges';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import ValidatorDashboard from './pages/ValidatorDashboard';
import Network from './pages/Network';
import BottomNav from './components/BottomNav';

const STORAGE_KEY = 'bitfitness_state_v3';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isVerifying, setIsVerifying] = useState(false);
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);
  const [lastLoggedWorkout, setLastLoggedWorkout] = useState<Workout | null>(null);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
    return {
      workouts: [],
      challenges: INITIAL_CHALLENGES,
      stats: { streak: 0, totalReps: 0, totalSets: 0 },
      theme: 'dark',
      aiOracleEnabled: true,
      userName: 'Satoshi_' + Math.floor(Math.random() * 1000)
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  // Reset states when page changes
  useEffect(() => {
    setHeaderTitle(null);
    if (currentPage !== 'log') {
      setLastLoggedWorkout(null);
    }
  }, [currentPage]);

  const runAIOracle = async (workout: Workout): Promise<{ status: VerificationStatus; reason: string; confidence: number }> => {
    if (!workout.photo || !state.aiOracleEnabled) {
      return { status: 'pending', reason: "No photo provided or Oracle disabled.", confidence: 0 };
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = workout.photo.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: `Act as a Proof-of-Work Oracle for a fitness app. Analyze this fitness proof photo. The user claims to have performed ${workout.reps} reps of ${workout.exercise}. Does it show real exercise? Output JSON.` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verified: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER, description: "0 to 100" },
              reason: { type: Type.STRING }
            },
            required: ["verified", "confidence", "reason"]
          }
        }
      });

      const result = JSON.parse(response.text);
      const status: VerificationStatus = (result.verified && result.confidence > 80) ? 'verified' : (result.verified ? 'pending' : 'flagged');
      
      return { status, reason: result.reason, confidence: result.confidence };
    } catch (error) {
      console.error("AI Oracle Error:", error);
      return { status: 'pending', reason: "Oracle network timeout.", confidence: 0 };
    }
  };

  const addWorkout = async (workout: Workout) => {
    let finalWorkout = { ...workout, participantName: state.userName };

    const needsVerification = state.aiOracleEnabled && workout.photo && (!workout.aiConfidence || workout.verificationStatus === 'pending');

    if (needsVerification) {
      setIsVerifying(true);
      const aiResult = await runAIOracle(workout);
      finalWorkout.verificationStatus = aiResult.status;
      finalWorkout.aiReason = aiResult.reason;
      finalWorkout.aiConfidence = aiResult.confidence;
    }

    await RelayService.broadcastBlock(finalWorkout, state.userName);

    setState(prev => {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = prev.stats.lastWorkoutDate;
      
      let newStreak = prev.stats.streak;
      const isFirstWorkoutToday = lastDate !== today;

      if (isFirstWorkoutToday) {
        if (lastDate) {
          const last = new Date(lastDate);
          const current = new Date(today);
          const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 1;
        } else {
          newStreak = 1;
        }
      }

      const updatedChallenges = prev.challenges.map(ch => {
        if (ch.joined && isFirstWorkoutToday && ch.currentDays < ch.targetDays) {
          return { ...ch, currentDays: ch.currentDays + 1 };
        }
        return ch;
      });

      return {
        ...prev,
        workouts: [finalWorkout, ...prev.workouts],
        challenges: updatedChallenges,
        stats: {
          streak: newStreak,
          lastWorkoutDate: today,
          totalReps: prev.stats.totalReps + workout.reps,
          totalSets: prev.stats.totalSets + workout.sets
        }
      };
    });
    
    setIsVerifying(false);
    setLastLoggedWorkout(finalWorkout);
  };

  const handleImportWorkouts = (importedWorkouts: Workout[]) => {
    setState(prev => {
      const existingIds = new Set(prev.workouts.map(w => w.id));
      const newWorkouts = importedWorkouts
        .filter(w => !existingIds.has(w.id))
        .map(w => ({ ...w, isImported: true }));
      
      return {
        ...prev,
        workouts: [...newWorkouts, ...prev.workouts]
      };
    });
  };

  const goBack = () => {
    if (currentPage === 'validator') setCurrentPage('settings');
    else if (currentPage === 'log') setCurrentPage('home');
    else setCurrentPage('home');
  };

  const renderPage = () => {
    if (isVerifying) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 view-container">
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 border-4 border-bitcoin/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-bitcoin border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center p-6">
             <div className="w-full h-full relative rounded-full overflow-hidden flex items-center justify-center bg-zinc-900 border-2 border-white/10 shadow-[0_0_50px_rgba(247,147,26,0.2)]">
               <i className="fa-brands fa-bitcoin text-bitcoin text-5xl absolute opacity-20"></i>
               <img 
                 src={BITFITNESS_LOGO} 
                 className="w-full h-full object-cover relative z-10 animate-pulse duration-[2000ms]" 
                 onError={(e) => (e.currentTarget.style.display = 'none')}
               />
             </div>
          </div>
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 italic uppercase leading-none">Mining Blocks</h2>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-black text-bitcoin bg-bitcoin/10 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-bitcoin/20">Syncing Node: {state.userName}</span>
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest animate-pulse">Broadcasting Proof of Work...</p>
          </div>
        </div>
      </div>
    );

    switch (currentPage) {
      case 'home': return <Home state={state} onNavigate={setCurrentPage} />;
      case 'network': return <Network currentUserName={state.userName} />;
      case 'log': return <LogWorkout onSave={addWorkout} onCancel={goBack} onHeaderUpdate={setHeaderTitle} lastWorkout={lastLoggedWorkout} />;
      case 'challenges': return <Challenges challenges={state.challenges} onJoin={(id) => setState(prev => ({...prev, challenges: prev.challenges.map(ch => ch.id === id ? {...ch, joined: true, startDate: Date.now()} : ch)}))} />;
      case 'progress': return <Progress workouts={state.workouts} stats={state.stats} />;
      case 'settings': return <Settings state={state} onToggleTheme={() => setState(p => ({...p, theme: p.theme === 'dark' ? 'light' : 'dark'}))} onToggleOracle={() => setState(p => ({...p, aiOracleEnabled: !p.aiOracleEnabled}))} onClearData={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }} onExport={() => {}} onOpenValidator={() => setCurrentPage('validator')} />;
      case 'validator': return (
        <ValidatorDashboard 
          workouts={state.workouts} 
          onUpdateStatus={(id, status, reason) => setState(p => ({...p, workouts: p.workouts.map(w => w.id === id ? {...w, verificationStatus: status, validatorReason: reason} : w)}))} 
          onImport={handleImportWorkouts} 
          onBack={goBack} 
        />
      );
      default: return <Home state={state} onNavigate={setCurrentPage} />;
    }
  };

  const isSubPage = ['log', 'validator'].includes(currentPage);
  const pageTitles: Record<string, string> = {
    'log': lastLoggedWorkout ? 'Mined Confirmed' : 'Log Computation',
    'validator': 'Validator Node'
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto relative shadow-[0_0_120px_rgba(0,0,0,0.15)] bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden border-x border-zinc-200 dark:border-zinc-900 flex flex-col">
      <header className="px-6 h-20 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 sticky top-0 z-40 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-2xl shrink-0 transition-all duration-300">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-11 flex justify-start">
            {isSubPage ? (
              <div className="relative group">
                <button 
                  onClick={goBack}
                  className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-lg text-zinc-500 hover:text-bitcoin transition-all active:scale-90"
                  aria-label="Go back"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <div className="absolute top-full left-0 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                    Back
                  </div>
                </div>
              </div>
            ) : (
              <div className="cursor-pointer group" onClick={() => setCurrentPage('home')}>
                <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-800 p-0.5 border border-white/10 shadow-xl group-active:scale-95 transition-all">
                  <img src={BITFITNESS_LOGO} alt="Logo" className="w-full h-full object-cover rounded-[14px]" />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col min-w-0 ml-1">
            <h1 className="text-xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50 italic uppercase leading-none truncate">
              {headerTitle || (isSubPage ? pageTitles[currentPage] : 'BitFitness')}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              {isSubPage ? (
                <span className={`text-[9px] font-black uppercase tracking-widest ${lastLoggedWorkout ? 'text-bitcoin' : 'text-zinc-400'}`}>
                  {lastLoggedWorkout ? 'Transaction Successful' : (currentPage === 'validator' ? 'Mempool Station' : 'Broadcast Protocol')}
                </span>
              ) : (
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Mainnet Online
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 justify-end w-20">
          {!isVerifying && !isSubPage && (
            <div className="relative group">
              <button 
                onClick={() => setCurrentPage('log')}
                className="w-11 h-11 rounded-2xl bitcoin-gradient text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-90 transition-all bitcoin-glow"
              >
                <i className="fa-solid fa-plus text-sm"></i>
              </button>
              <div className="absolute top-full right-0 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                  New Block
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div key={currentPage + (isVerifying ? '-verifying' : '') + (lastLoggedWorkout ? '-success' : '')} className="view-container">
          {renderPage()}
        </div>
      </main>
      
      {!isVerifying && <BottomNav current={currentPage} onNavigate={setCurrentPage} />}
    </div>
  );
};

export default App;
