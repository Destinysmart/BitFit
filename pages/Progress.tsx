
import React, { useMemo, useState, useEffect } from 'react';
import { Workout, UserStats } from '../types';
import { RelayService } from '../services/relay';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

interface ProgressProps {
  workouts: Workout[];
  stats: UserStats;
}

const Progress: React.FC<ProgressProps> = ({ workouts, stats }) => {
  const [networkStats, setNetworkStats] = useState({ totalReps: 0 });

  useEffect(() => {
    setNetworkStats(RelayService.getNetworkStats());
  }, []);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayWorkouts = workouts.filter(w => 
        new Date(w.timestamp).toISOString().split('T')[0] === date
      );
      return {
        date: date.slice(5),
        reps: dayWorkouts.reduce((sum, w) => sum + w.reps, 0)
      };
    });
  }, [workouts]);

  const formatDuration = (exercise: string, duration?: number) => {
    if (!duration) return '';
    const unit = exercise.toLowerCase().includes('run') ? 'min' : 
                 exercise.toLowerCase().includes('plank') ? 'sec' : 'min';
    return `• ${duration}${unit}`;
  };

  return (
    <div className="space-y-10 pb-32 page-transition">
      <header className="space-y-2">
        <h2 className="text-4xl font-extrabold italic uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 leading-none">Global Ledger</h2>
        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">Immutable Personal Proof-of-Work</p>
      </header>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[36px] border border-zinc-100 dark:border-white/5 shadow-sm transition-all hover:shadow-xl">
          <div className="w-12 h-12 bg-bitcoin/10 rounded-2xl flex items-center justify-center mb-6 text-bitcoin border border-bitcoin/10">
             <i className="fa-solid fa-layer-group text-xl"></i>
          </div>
          <span className="text-[10px] font-black uppercase text-zinc-400 block mb-2 tracking-widest">Node Total</span>
          <div className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter leading-none">{stats.totalReps.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[36px] border border-zinc-100 dark:border-white/5 shadow-sm transition-all hover:shadow-xl">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
             <i className="fa-solid fa-network-wired text-xl"></i>
          </div>
          <span className="text-[10px] font-black uppercase text-zinc-400 block mb-2 tracking-widest">Hash Weight</span>
          <div className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter leading-none">
            {((stats.totalReps / (networkStats.totalReps || 1)) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[40px] p-8 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Weekly Performance</h3>
          <div className="w-8 h-8 rounded-full bg-bitcoin/10 flex items-center justify-center text-bitcoin">
             <i className="fa-solid fa-chart-simple text-xs"></i>
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: '900', fill: '#71717a' }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(247, 147, 26, 0.05)' }} 
                contentStyle={{ 
                  borderRadius: '24px', 
                  backgroundColor: '#09090b', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', 
                  fontSize: '11px',
                  fontWeight: '900',
                  padding: '12px 16px'
                }} 
              />
              <Bar dataKey="reps" radius={[8, 8, 8, 8]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.reps > 0 ? '#F7931A' : 'rgba(113, 113, 122, 0.1)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Block Verification History</h3>
        </div>
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <div className="py-24 text-center bg-white dark:bg-zinc-900 rounded-[40px] border border-dashed border-zinc-200 dark:border-white/5">
              <i className="fa-solid fa-box-open text-4xl text-zinc-200 dark:text-zinc-800 mb-6"></i>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Genesis block not found.</p>
            </div>
          ) : (
            workouts.map((w, i) => (
              <div 
                key={w.id} 
                className="group flex flex-col p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-white/5 transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl hover:border-bitcoin/20 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-5 w-full">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                    w.verificationStatus === 'verified' 
                      ? 'bg-zinc-900 dark:bg-zinc-800 border border-white/5' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}>
                     <i className={`fa-solid ${w.exercise.toLowerCase().includes('run') ? 'fa-person-running' : 'fa-dumbbell'} text-xl ${w.verificationStatus === 'verified' ? 'text-bitcoin' : ''}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white truncate mb-1">{w.exercise}</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      {w.reps}R • {w.sets}S {formatDuration(w.exercise, w.duration)}
                      <span className="opacity-30">•</span>
                      {new Date(w.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                     <div className={`text-[10px] font-black uppercase mb-1 px-3 py-1 rounded-full border ${
                       w.verificationStatus === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                     }`}>
                       {w.verificationStatus}
                     </div>
                     <div className="text-[9px] font-mono text-zinc-400 font-bold">#{w.id.slice(0, 8)}</div>
                  </div>
                </div>
                {w.validatorReason && (
                  <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic">
                    <span className="font-black text-bitcoin uppercase mr-1 not-italic">Node Note:</span>
                    {w.validatorReason}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Progress;