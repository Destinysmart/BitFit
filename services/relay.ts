
import { GoogleGenAI, Type } from "@google/genai";
import { Workout, PeerWorkout, Challenge } from "../types";

const RELAY_KEY = 'bitfitness_relay_v3';
const CHALLENGE_RELAY_KEY = 'bitfitness_challenges_v2';
const SYNC_COOLDOWN = 30000; // 30 seconds

export class RelayService {
  static async broadcastBlock(workout: Workout, userName: string): Promise<void> {
    try {
      const relayData = this.getRelayData();
      const newEntry: PeerWorkout = {
        ...workout,
        peerName: userName,
        location: 'Local Node'
      };
      
      if (!relayData.some(b => b.id === workout.id)) {
        relayData.unshift(newEntry);
        localStorage.setItem(RELAY_KEY, JSON.stringify(relayData.slice(0, 150)));
      }
    } catch (e) {
      console.error("Critical: Storage failed during broadcast", e);
    }
  }

  static async broadcastChallenge(challenge: Challenge): Promise<void> {
    const challenges = this.getPublicChallenges();
    if (!challenges.some(c => c.id === challenge.id)) {
      challenges.unshift({ ...challenge, isPublic: true });
      localStorage.setItem(CHALLENGE_RELAY_KEY, JSON.stringify(challenges.slice(0, 50)));
    }
  }

  static getPublicChallenges(): Challenge[] {
    try {
      const data = localStorage.getItem(CHALLENGE_RELAY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async fetchGlobalLedger(): Promise<PeerWorkout[]> {
    let relayData = this.getRelayData();
    const now = Date.now();
    const lastSync = parseInt(localStorage.getItem('bitfitness_last_sync') || '0');

    // Optimization: Skip API if node is offline or recently synced
    if (!navigator.onLine) return relayData;
    if (relayData.length >= 10 && (now - lastSync < SYNC_COOLDOWN)) return relayData;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate 5 fitness block updates for the Bitcoin global ledger. Use crypto-names like 'CyberNinja', 'BlockStacker', 'SatsSquatter'. Randomize reps and statuses. Return valid JSON only.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                peerName: { type: Type.STRING },
                location: { type: Type.STRING },
                exercise: { type: Type.STRING },
                reps: { type: Type.NUMBER },
                sets: { type: Type.NUMBER },
                timestamp: { type: Type.NUMBER },
                verificationStatus: { type: Type.STRING, enum: ['verified', 'pending', 'rejected', 'flagged'] },
                challengeName: { type: Type.STRING }
              },
              required: ["peerName", "location", "exercise", "reps", "id", "verificationStatus"]
            }
          }
        }
      });

      const syntheticPeers: PeerWorkout[] = JSON.parse(response.text);
      const existingIds = new Set(relayData.map(r => r.id));
      const filteredNew = syntheticPeers.filter(p => !existingIds.has(p.id));
      
      relayData = [...filteredNew, ...relayData].slice(0, 200);
      localStorage.setItem(RELAY_KEY, JSON.stringify(relayData));
      localStorage.setItem('bitfitness_last_sync', now.toString());
    } catch (e) {
      console.warn("Mempool Sync Failed (Likely Offline/API issues). Falling back to local cache.", e);
    }

    return relayData;
  }

  private static getRelayData(): PeerWorkout[] {
    try {
      const data = localStorage.getItem(RELAY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getNetworkStats() {
    const data = this.getRelayData();
    return {
      totalReps: data.reduce((sum, w) => sum + (w.reps || 0), 0),
      activeNodes: Math.max(21, 21 + Math.floor(data.length * 1.5))
    };
  }
}
