
export type VerificationStatus = 'pending' | 'verified' | 'flagged' | 'rejected';
export type ChallengeCategory = 'Strength' | 'Endurance' | 'Genesis' | 'Sprint' | 'Community';
export type ChallengeStatus = 'draft' | 'active' | 'finalizing' | 'settled';
export type RecurrenceProtocol = 'once' | 'daily' | 'weekly' | 'monthly';

export interface Workout {
  id: string;
  exercise: string;
  reps: number;
  sets: number;
  duration?: number;
  timestamp: number;
  photo?: string;
  xProofUrl?: string;
  powVerified: boolean;
  verificationStatus: VerificationStatus;
  aiReason?: string;
  aiConfidence?: number;
  validatorReason?: string;
  isImported?: boolean;
  participantName?: string;
  challengeId?: string; 
  challengeName?: string;
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
  creatorNode?: string;
  category: ChallengeCategory;
  targetTotalReps?: number;
  isPublic?: boolean;
  // New Settlement Fields
  rewardSats?: number;
  recurrence: RecurrenceProtocol;
  status: ChallengeStatus;
  payoutProofUrl?: string;
}

export interface UserStats {
  streak: number;
  lastWorkoutDate?: string;
  totalReps: number;
  totalSets: number;
}

export type Page = 'home' | 'network' | 'log' | 'challenges' | 'progress' | 'settings' | 'validator' | 'tutorial';

export interface AppState {
  workouts: Workout[];
  challenges: Challenge[];
  stats: UserStats;
  theme: 'light' | 'dark';
  aiOracleEnabled: boolean;
  userName: string;
  lightningAddress: string;
}
