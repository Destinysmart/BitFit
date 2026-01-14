
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Page, AppState, Workout, Challenge, UserStats, VerificationStatus, ChallengeStatus } from './types';
import { INITIAL_CHALLENGES, BITFITNESS_LOGO } from './constants';
import { RelayService } from './services/relay';
import Home from './pages/Home';
import LogWorkout from './pages/LogWorkout';
import Challenges from './pages/Challenges';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import ValidatorDashboard from './pages/ValidatorDashboard';
import Network from './pages/Network';
import Tutorial from './pages/Tutorial';
import BottomNav from './components/BottomNav';

const STORAGE_KEY = 'bitfitness_state_v4';

const deriveAppState = (state: AppState): AppState => {
  const { workouts, challenges } = state;
  const validWorkouts = workouts.filter(w => w.verificationStatus !== 'rejected');
  
  const totalReps = validWorkouts.reduce((sum, w) => sum + w.reps, 0);
  const totalSets = validWorkouts.reduce((sum, w) => sum + w.sets, 0);
  
  const uniqueDays = Array.from(new Set(
    validWorkouts.map(w => new Date(w.timestamp).toISOString().split('T')[0])
  )).sort();
  
  let streak = 0;
  const lastWorkoutDate = uniqueDays.length > 0 ? uniqueDays[uniqueDays.length - 1] : undefined;

  if (uniqueDays.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastWorkoutDate === today || lastWorkoutDate === yesterday) {
      streak = 1;
      for (let i = uniqueDays.length - 1; i > 0; i--) {
        const d1 = new Date(uniqueDays[i]);
        const d2 = new Date(uniqueDays[i-1]);
        if (Math.floor((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24)) === 1) streak++;
        else break;
      }
    }
  }

  const updatedChallenges = challenges.map(ch => {
    const questWorkouts = validWorkouts.filter(w => w.challengeId === ch.id);
    const questDays = new Set(questWorkouts.map(w => new Date(w.timestamp).toISOString().split('T')[0]));
    return {
      ...ch,
      currentDays: questDays.size
    };
  });

  return {
    ...state,
    stats: { streak, lastWorkoutDate, totalReps, totalSets },
    challenges: updatedChallenges
  };
};

// Fix: Completed the App component and added default export
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isVerifying, setIsVerifying] = useState(false);
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);
  const [lastLoggedWorkout, setLastLoggedWorkout] = useState<Workout | null>(null);
  const [rawState, setRawState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.challenges = parsed.challenges.map((c: any) => ({ 
          ...c, 
          category: c.category || 'Genesis',
          joined: !!c.joined,
          status: c.status || 'active',
          recurrence: c.recurrence || 'once'
        }));
        if (!parsed.lightningAddress) parsed.lightningAddress = '';
        return parsed;
      } catch (e) { console.error(e); }
    }
    return {
      workouts: [],
      challenges: INITIAL_CHALLENGES.map(c => ({ 
        ...c, 
        category: 'Genesis' as const, 
        joined: false, 
        status: 'active' as const, 
        recurrence: 'weekly' as const,
        rewardSats: 500 
      })),
      stats: { streak: 0, totalReps: 0, totalSets: 0 },
      theme: 'dark',
      aiOracleEnabled: true,
      userName: 'Node_' + Math.floor(Math.random() * 10000),
      lightningAddress: ''
    };
  });

  const state = useMemo(() => deriveAppState(rawState), [rawState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawState));
    document.documentElement.classList.toggle('dark', rawState.theme === 'dark');
  }, [rawState]);

  const addWorkout = async (workout: Workout) => {
    const activeChallenge = state.challenges.find(c => c.joined && c.currentDays < c.targetDays && c.status === 'active');
    let finalWorkout: Workout = { 
      ...workout, 
      participantName: state.userName,
      challengeId: activeChallenge?.id,
      challengeName: activeChallenge?.title
    };

    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 800));
    await RelayService.broadcastBlock(finalWorkout, state.userName);

    setRawState(prev => ({
      ...prev,
      workouts: [finalWorkout, ...prev.workouts]
    }));
    
    setIsVerifying(false);
    setLastLoggedWorkout(finalWorkout);
  };

  const forgeChallenge = async (challenge: Challenge) => {
    await RelayService.broadcastChallenge(challenge);
    setRawState(prev => ({
      ...prev,
      challenges: [challenge, ...prev.challenges]
    }));
  };

  const updateChallengeStatus = (id: string, status: ChallengeStatus, proof?: string) => {
    setRawState(prev => ({
      ...prev,
      challenges: prev.challenges.map(ch => ch.id === id ? { ...ch, status, payoutProofUrl: proof || ch.payoutProofUrl } : ch)
    }));
  };

  const updateWorkoutStatus = (id: string, status: VerificationStatus, reason?: string) => {
    setRawState(prev => {
      if (status === 'rejected') {
        return {
          ...prev,
          workouts: prev.workouts.filter(w => w.id !== id)
        };
      }
      
      const updatedWorkouts = prev.workouts.map(w => 
        w.id === id ? { ...w, verificationStatus: status, validatorReason: reason } : w
      );
      return { ...prev, workouts: updatedWorkouts };
    });
  };

  const handleImportWorkouts = (importedWorkouts: Workout[]) => {
    setRawState(prev => {
      const existingIds = new Set(prev.workouts.map(w => w.id));
      const newWorkouts = importedWorkouts.filter(w => !existingIds.has(w.id)).map(w => ({ ...w, isImported: true }));
      return { ...prev, workouts: [...newWorkouts, ...prev.workouts] };
    });
  };

  const goBack = () => setCurrentPage(['validator', 'tutorial'].includes(currentPage) ? 'settings' : 'home');

  return (
    <div className="min-h-screen max-w-lg mx-auto relative bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden border-x border-zinc-200 dark:border-zinc-900 flex flex-col">
      <header className="px-6 h-20 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 sticky top-0 z-40 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={goBack} className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-lg text-zinc-500">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black italic uppercase leading-none truncate">
              {headerTitle || (currentPage === 'validator' ? 'Validator' : (currentPage === 'network' ? 'Ledger' : (currentPage === 'tutorial' ? 'Manual' : 'BitFitness')))}
            </h1>
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-1">Settlement Node</span>
          </div>
        </div>

        <button onClick={() => setCurrentPage('tutorial')} className="w-12 h-12 bg-zinc-900 rounded-[18px] flex items-center justify-center border border-white/10">
          <i className="fa-solid fa-question text-white/50 text-sm"></i>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        {currentPage === 'home' && <Home state={state} onNavigate={setCurrentPage} />}
        {currentPage === 'log' && (
          <LogWorkout 
            onSave={addWorkout} 
            onCancel={() => setCurrentPage('home')}
            onHeaderUpdate={setHeaderTitle}
            lastWorkout={lastLoggedWorkout}
          />
        )}
        {currentPage === 'challenges' && (
          <Challenges 
            challenges={state.challenges} 
            onJoin={(id) => setRawState(p => ({ ...p, challenges: p.challenges.map(c => c.id === id ? { ...c, joined: true } : c) }))}
            onForge={forgeChallenge}
            onUpdateStatus={updateChallengeStatus}
            onLogQuestWork={(chId, proof) => {
               setRawState(p => ({
                 ...p,
                 challenges: p.challenges.map(c => c.id === chId ? { ...c, currentDays: Math.min(c.targetDays, c.currentDays + 1) } : c)
               }));
            }}
            userName={state.userName}
          />
        )}
        {currentPage === 'progress' && <Progress workouts={state.workouts} stats={state.stats} />}
        {currentPage === 'network' && <Network currentUserName={state.userName} />}
        {currentPage === 'settings' && (
          <Settings 
            state={state}
            onToggleTheme={() => setRawState(p => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }))}
            onToggleOracle={() => setRawState(p => ({ ...p, aiOracleEnabled: !p.aiOracleEnabled }))}
            onClearData={() => {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }}
            onExport={() => {}}
            onOpenValidator={() => setCurrentPage('validator')}
            onUpdateProfile={(name, lnAddr) => setRawState(p => ({ ...p, userName: name, lightningAddress: lnAddr }))}
          />
        )}
        {currentPage === 'validator' && (
          <ValidatorDashboard 
            workouts={state.workouts}
            challenges={state.challenges}
            onUpdateStatus={updateWorkoutStatus}
            onUpdateChallengeStatus={(id, status) => updateChallengeStatus(id, status)}
            onImport={handleImportWorkouts}
            onBack={goBack}
          />
        )}
        {currentPage === 'tutorial' && <Tutorial onDismiss={() => setCurrentPage('home')} />}
      </main>

      <BottomNav current={currentPage} onNavigate={(p) => { setCurrentPage(p); setHeaderTitle(null); setLastLoggedWorkout(null); }} />

      {isVerifying && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-12">
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 mx-auto bitcoin-gradient rounded-[32px] flex items-center justify-center shadow-2xl animate-spin-slow">
                <i className="fa-solid fa-gear text-white text-4xl"></i>
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Mining Block...</h3>
                <p className="text-[10px] font-black text-bitcoin uppercase tracking-[0.4em]">Propagating Consensus</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
