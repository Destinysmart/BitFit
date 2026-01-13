
import { GoogleGenAI, Type } from "@google/genai";
import { Workout, PeerWorkout } from "../types";

const RELAY_KEY = 'bitfitness_relay_v1';

export class RelayService {
  /**
   * Broadcasts a local block to the global relay.
   */
  static async broadcastBlock(workout: Workout, userName: string): Promise<void> {
    const relayData = this.getRelayData();
    const newEntry: PeerWorkout = {
      ...workout,
      peerName: userName,
      location: 'Local Node'
    };
    
    // Check if block already exists in relay using ID to prevent double-spending reps
    if (!relayData.some(b => b.id === workout.id)) {
      relayData.unshift(newEntry);
      localStorage.setItem(RELAY_KEY, JSON.stringify(relayData.slice(0, 50)));
    }
  }

  /**
   * Fetches the global ledger.
   * Uses Gemini to simulate a high-activity peer-to-peer network if the local cache is sparse.
   */
  static async fetchGlobalLedger(): Promise<PeerWorkout[]> {
    let relayData = this.getRelayData();
    const now = Date.now();
    const lastSync = parseInt(localStorage.getItem('bitfitness_last_sync') || '0');

    // Simulate network traffic if relay is sparse or sync is old
    if (relayData.length < 8 || (now - lastSync > 120000)) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Generate 5 unique fitness blocks for a global Bitcoin-themed fitness ledger. Include crypto-style usernames (e.g. Satoshi_99, Hal_Finney), location (Global Relay), common exercises, and high reps. Return as valid JSON array.",
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
                  timestamp: { type: Type.NUMBER }
                },
                required: ["peerName", "location", "exercise", "reps", "id"]
              }
            }
          }
        });

        const syntheticPeers: PeerWorkout[] = JSON.parse(response.text);
        // Deduplicate and merge
        const existingIds = new Set(relayData.map(r => r.id));
        const filteredNew = syntheticPeers.filter(p => !existingIds.has(p.id));
        
        relayData = [...filteredNew, ...relayData].slice(0, 50);
        localStorage.setItem(RELAY_KEY, JSON.stringify(relayData));
        localStorage.setItem('bitfitness_last_sync', now.toString());
      } catch (e) {
        console.warn("Relay sync warning: Node operating in isolated mode.", e);
      }
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
      activeNodes: Math.max(21, data.length * 7 + Math.floor(Math.random() * 5))
    };
  }
}
