
import React from 'react';
import { Workout } from '../types';

interface WorkoutCardProps {
  workout: Workout;
  index: number;
  isSelf?: boolean;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, index, isSelf }) => {
  const formatDuration = (exercise: string, duration?: number) => {
    if (!duration) return '';
    const unit = exercise.toLowerCase().includes('run') ? 'min' : 
                 exercise.toLowerCase().includes('plank') ? 'sec' : 'min';
    return `• ${duration}${unit}`;
  };

  const statusColors = {
    verified: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    rejected: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    pending: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
    flagged: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
  };

  return (
    <div 
      className={`group relative flex flex-col p-5 bg-white dark:bg-zinc-900 rounded-3xl border transition-all duration-300 hover:shadow-hard hover:-translate-y-0.5 animate-enter ${
        isSelf ? 'border-bitcoin/20 shadow-bitcoin/5' : 'border-zinc-100 dark:border-zinc-800'
      }`} 
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-4 w-full">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
          workout.verificationStatus === 'verified' 
            ? 'bg-zinc-950 dark:bg-zinc-800 text-bitcoin' 
            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400'
        }`}>
          <i className={`fa-solid ${workout.exercise.toLowerCase().includes('run') ? 'fa-person-running' : 'fa-dumbbell'} text-xl`}></i>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-bold text-[15px] tracking-tight text-zinc-900 dark:text-white truncate">
              {workout.exercise}
            </h4>
            {isSelf && (
              <span className="text-[7px] font-black tracking-widest text-bitcoin bg-bitcoin/10 px-1.5 py-0.5 rounded uppercase">
                Self
              </span>
            )}
          </div>
          <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="text-zinc-900 dark:text-zinc-200 font-bold">{workout.reps} reps</span>
            <span className="opacity-40">•</span>
            <span>{workout.sets} sets</span>
            {workout.duration && (
              <>
                <span className="opacity-40">•</span>
                <span>{formatDuration(workout.exercise, workout.duration).replace('• ', '')}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border transition-colors ${statusColors[workout.verificationStatus]}`}>
            {workout.verificationStatus}
          </div>
          <span className="text-[8px] font-mono text-zinc-400 font-medium">#{workout.id.slice(0, 6).toUpperCase()}</span>
        </div>
      </div>

      {workout.validatorReason && (
        <div className="mt-4 p-3 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 text-[10px] text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
          <span className="font-bold text-bitcoin mr-1 not-italic">Validator:</span>
          {workout.validatorReason}
        </div>
      )}
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] font-medium text-zinc-400">
          {new Date(workout.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {workout.xProofUrl && (
          <a 
            href={workout.xProofUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-bitcoin hover:underline flex items-center gap-1"
          >
            <i className="fa-brands fa-x-twitter text-[8px]"></i>
            Verify Source
          </a>
        )}
      </div>
    </div>
  );
};

export default React.memo(WorkoutCard);
