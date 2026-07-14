import { create } from 'zustand';
import { PhandaEngine } from "../../engine/PhandaEngine";
import { ReplayRecord } from "../../replay/ReplayRecord";
import { ExpoMediaStore } from "../../media/ExpoMediaStore";
import { ExpoMediaHasher } from "../../media/ExpoMediaHasher";
import { AsyncStorageAdapter } from "../../storage/AsyncStorageAdapter";

// Create the global instance of the engine, injecting physical device adapters
export const engine = new PhandaEngine(
  new AsyncStorageAdapter(),
  new ExpoMediaStore(),
  new ExpoMediaHasher()
);

interface PhandaState {
  timeline: ReplayRecord[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  refreshTimeline: () => Promise<void>;
}

export const usePhandaStore = create<PhandaState>((set, get) => {
  
  // Wire up the reactive Engine Events
  engine.events.on("TimelineUpdated", () => {
    // Reactively refresh the timeline whenever the engine says something changed
    get().refreshTimeline();
  });

  return {
    timeline: [],
    isLoading: false,
    error: null,

    initialize: async () => {
      await get().refreshTimeline();
    },

    refreshTimeline: async () => {
      set({ isLoading: true, error: null });
      try {
        const records = await engine.getTimeline("shallow");
        set({ timeline: records, isLoading: false });
      } catch (e: any) {
        set({ error: e.message, isLoading: false });
      }
    }
  };
});
