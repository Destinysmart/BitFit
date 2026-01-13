
export type VerificationStatus = 'pending' | 'verified' | 'flagged' | 'rejected';

export interface Workout {
  id: string;
  exercise: string;
  reps: number;
  sets: number;
  duration?: number;
  timestamp: number;
  photo?: string; // base64
  powVerified: boolean; // User's self-attestation
  verificationStatus: VerificationStatus; // AI or Admin status
  aiReason?: string;
  aiConfidence?: number; // 0-100 score from Oracle
  validatorReason?: string; // Manual note from validator node
  isImported?: boolean;
  participantName?: string;
}

export interface PeerWorkout extends Omit<Workout, 'photo'> {
  peerName: string;
  location: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetDays: number;
  currentDays: number;
  joined: boolean;
  startDate?: number;
}

export interface UserStats {
  streak: number;
  lastWorkoutDate?: string; // YYYY-MM-DD
  totalReps: number;
  totalSets: number;
}

export type Page = 'home' | 'network' | 'log' | 'challenges' | 'progress' | 'settings' | 'validator';

export interface AppState {
  workouts: Workout[];
  challenges: Challenge[];
  stats: UserStats;
  theme: 'light' | 'dark';
  aiOracleEnabled: boolean;
  userName: string;
}