
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Workout, UserStats } from '../types';
import { RelayService } from '../services/relay';
import WorkoutCard from '../components/WorkoutCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
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
  const [displayLimit, setDisplayLimit] = useState(10);

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
        date: date.slice(5).replace('-', '/'),
        reps: dayWorkouts.reduce((sum, w) => sum + w.reps, 0)
      };
    });
  }, [workouts]);

  const loadMore = useCallback(() => {
    setDisplayLimit(prev => prev + 10);
  }, []);

  const visibleWorkouts = useMemo(() => 
    workouts.slice(0, displayLimit), 
    [workouts, displayLimit]
  );

  return (
    <div className="space-y-10 pb-32 page-transition">
      <header className="space-y-1">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 leading-none">Global Ledger</h2>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Personal Proof-of-Work Audit</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-soft">
          <div className="w-10 h-10 bg-bitcoin/10 rounded-xl flex items-center justify-center mb-4 text-bitcoin">
             <i className="fa-solid fa-cube text-lg"></i>
          </div>
          <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1 tracking-widest">Total Reps</span>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">{stats.totalReps.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-soft">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-4 text-zinc-500">
             <i className="fa-solid fa-network-wired text-lg"></i>
          </div>
          <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1 tracking-widest">Hash Weight</span>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
            {((stats.totalReps / (networkStats.totalReps || 1)) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-soft">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Weekly Throughput</h3>
          <i className="fa-solid fa-chart-line text-bitcoin/30"></i>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 8, fontWeight: '700', fill: '#71717a' }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(247, 147, 26, 0.05)' }} 
                contentStyle={{ 
                  borderRadius: '16px', 
                  backgroundColor: '#09090b', 
                  border: 'none',
                  color: '#fff', 
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '8px 12px'
                }} 
              />
              <Bar dataKey="reps" radius={[6, 6, 6, 6]} barSize={24}>
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
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verified Block History</h3>
        </div>
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
              <i className="fa-solid fa-ghost text-2xl text-zinc-300 dark:text-zinc-700 mb-4"></i>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Chain is currently empty</p>
            </div>
          ) : (
            <>
              {visibleWorkouts.map((w, i) => (
                <WorkoutCard key={w.id} workout={w} index={i} isSelf={true} />
              ))}
              {workouts.length > displayLimit && (
                <button 
                  onClick={loadMore}
                  className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-bitcoin transition-colors"
                >
                  Load More Blocks
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default React.memo(Progress);
