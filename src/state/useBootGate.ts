/**
 * Boot Convergence Gate
 *
 * Ordered convergence:
 *   1. Auth resolves → identity truth is established
 *   2. Kernel completes first tick AFTER auth is ready → computation truth is valid
 *   3. systemReady = true → splash releases → router renders
 *
 * The kernel is NOT allowed to declare itself ready before auth resolves.
 * This prevents "valid computation on invalid identity state" (cold-start desync).
 *
 * Usage (read):
 *   const systemReady = useBootGate(state => state.systemReady);
 *
 * Usage (write — from subsystems only, never from UI):
 *   useBootGate.getState().setAuthReady(true);
 *   useBootGate.getState().setKernelReady(true);
 */

import { create } from 'zustand';

type BootState = {
  authReady: boolean;
  kernelReady: boolean;
  systemReady: boolean;
  // Timestamps for Boot Ledger Trace — observability without side effects
  authReadyAt: number | null;
  kernelReadyAt: number | null;
  systemReadyAt: number | null;
  setAuthReady: (v: boolean) => void;
  setKernelReady: (v: boolean) => void;
};

export const useBootGate = create<BootState>((set, get) => ({
  authReady: false,
  kernelReady: false,
  systemReady: false,
  authReadyAt: null,
  kernelReadyAt: null,
  systemReadyAt: null,

  setAuthReady: (v: boolean) => {
    const now = Date.now();
    set({ authReady: v, authReadyAt: now });
    // If kernel already completed a tick (and was waiting for auth), converge now
    if (v && get().kernelReady) {
      set({ systemReady: true, systemReadyAt: now });
    }
  },

  setKernelReady: (v: boolean) => {
    const now = Date.now();
    set({ kernelReady: v, kernelReadyAt: now });
    // Kernel ready is only meaningful AFTER auth is established
    if (v && get().authReady) {
      set({ systemReady: true, systemReadyAt: now });
    }
    // If authReady is false here, systemReady stays false.
    // The kernel keeps ticking — scheduler will retry on next tick.
  },
}));
