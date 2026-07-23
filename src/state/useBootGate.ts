/**
 * Boot Convergence Gate
 *
 * Ordered convergence:
 *   1. App Launch (APP_STARTED)
 *   2. Handshake (HANDSHAKE_COMPLETED / HANDSHAKE_FAILED)
 *   3. Auth Hydration (AUTH_HYDRATED)
 *   4. Session Validated (SESSION_VALIDATED)
 *   5. Bootstrap (BOOTSTRAP_COMPLETED)
 *   6. Ready (READY)
 */

import { create } from 'zustand';

export type BootPhase = 
  | 'APP_STARTED'
  | 'HANDSHAKE_COMPLETED'
  | 'HANDSHAKE_FAILED'
  | 'AUTH_HYDRATED'
  | 'SESSION_VALIDATED'
  | 'BOOTSTRAP_COMPLETED'
  | 'READY';

type BootState = {
  phase: BootPhase;
  apiReachable: boolean | null;
  authReady: boolean;
  systemReady: boolean;
  
  // Observability Ledger
  events: { phase: BootPhase; timestamp: number }[];

  setPhase: (phase: BootPhase) => void;
  setApiReachable: (v: boolean) => void;
  setAuthReady: (v: boolean) => void;
};

export const useBootGate = create<BootState>((set, get) => ({
  phase: 'APP_STARTED',
  apiReachable: null,
  authReady: false,
  systemReady: false,
  events: [{ phase: 'APP_STARTED', timestamp: Date.now() }],

  setPhase: (phase: BootPhase) => {
    set((state) => ({
      phase,
      events: [...state.events, { phase, timestamp: Date.now() }]
    }));
  },

  setApiReachable: (v: boolean) => {
    set({ apiReachable: v });
    get().setPhase(v ? 'HANDSHAKE_COMPLETED' : 'HANDSHAKE_FAILED');
  },

  setAuthReady: (v: boolean) => {
    set({ authReady: v });
    if (v) {
      get().setPhase('AUTH_HYDRATED');
      // Auth is the only requirement now that kernel is on backend
      set({ systemReady: true });
      get().setPhase('READY');
    }
  },
}));
