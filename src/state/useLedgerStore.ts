import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MediaType = 'text' | 'voice' | 'photo' | 'document' | 'location';

/**
 * An observation's display state on the dashboard/timeline.
 *
 * Doctrine: the observation itself is NEVER modified or deleted.
 * Only its presentation state changes.
 *
 *   visible  — default; shown in timeline order
 *   hidden   — "Hide from Dashboard"; still in ledger and replay
 *   pinned   — anchored at the top of every timeline view
 */
export type ObservationDisplayState = 'visible' | 'hidden' | 'pinned';

export interface Observation {
  id: string;
  timestamp: string;
  type: MediaType;
  content: string;
  mediaUri?: string;
  /** Presentation state. Never affects the underlying ledger record. */
  displayState: ObservationDisplayState;
  /** Stable order key for pinned items. Lower = higher on screen. */
  pinnedOrder?: number;
}

interface LedgerState {
  observations: Observation[];

  /** Append a new observation to the ledger. Observations are never removed. */
  appendObservation: (obs: Omit<Observation, 'id' | 'timestamp' | 'displayState' | 'pinnedOrder'>) => void;

  /**
   * Hide an observation from the dashboard/timeline.
   * The record remains immutable in the ledger and always appears in replay.
   */
  hideObservation: (id: string) => void;

  /**
   * Restore a hidden observation back to the visible timeline.
   */
  unhideObservation: (id: string) => void;

  /**
   * Pin an observation so it always appears at the top of the timeline.
   * Pinned observations remain part of the full immutable ledger.
   */
  pinObservation: (id: string) => void;

  /**
   * Unpin an observation, returning it to chronological position.
   */
  unpinObservation: (id: string) => void;

  /**
   * Immutable replay stream — returns ALL observations in chronological order,
   * regardless of display state. Used for audit, continuity, and replay.
   * This list is never filtered.
   */
  getReplayStream: () => Observation[];

  /**
   * Dashboard / timeline display stream.
   * Returns pinned observations first (by pinnedOrder), then visible
   * observations in reverse-chronological order.
   * Hidden observations are excluded from this view only.
   */
  getVisibleStream: () => Observation[];
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      observations: [],

      appendObservation: (obs) =>
        set((state) => {
          const newObs: Observation = {
            ...obs,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString(),
            displayState: 'visible',
          };
          // Ledger is always sorted newest-first for replay.
          return {
            observations: [...state.observations, newObs].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            ),
          };
        }),

      hideObservation: (id) =>
        set((state) => ({
          observations: state.observations.map((obs) =>
            obs.id === id ? { ...obs, displayState: 'hidden' } : obs
          ),
        })),

      unhideObservation: (id) =>
        set((state) => ({
          observations: state.observations.map((obs) =>
            obs.id === id ? { ...obs, displayState: 'visible' } : obs
          ),
        })),

      pinObservation: (id) =>
        set((state) => {
          // Assign a pinnedOrder one lower than the current minimum so it
          // goes to the top, or 0 if this is the first pin.
          const pinned = state.observations.filter((o) => o.displayState === 'pinned');
          const minOrder = pinned.length > 0
            ? Math.min(...pinned.map((o) => o.pinnedOrder ?? 0))
            : 1;
          return {
            observations: state.observations.map((obs) =>
              obs.id === id
                ? { ...obs, displayState: 'pinned', pinnedOrder: minOrder - 1 }
                : obs
            ),
          };
        }),

      unpinObservation: (id) =>
        set((state) => ({
          observations: state.observations.map((obs) =>
            obs.id === id
              ? { ...obs, displayState: 'visible', pinnedOrder: undefined }
              : obs
          ),
        })),

      getReplayStream: () =>
        // Always returns the complete, unfiltered ledger. Immutable by doctrine.
        [...get().observations].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),

      getVisibleStream: () => {
        const all = get().observations;
        const pinned = all
          .filter((o) => o.displayState === 'pinned')
          .sort((a, b) => (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0));
        const visible = all
          .filter((o) => o.displayState === 'visible')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return [...pinned, ...visible];
      },
    }),
    {
      name: 'phanda-ledger-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
