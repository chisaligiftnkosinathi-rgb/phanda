import { useBootGate } from '@/state/useBootGate';
import { executeRuntimeTick } from './runtimeLoop';

let isRunningTick = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

// Tracks whether the kernel has produced at least one valid output.
// This is an EXECUTION flag only — boot convergence is handled separately.
let hasExecuted = false;

const TICK_INTERVAL_MS = 2000; // 2 seconds

/**
 * Reconciles boot state after each tick execution.
 *
 * Separated from execution so that:
 *   - kernel truth (hasExecuted) is independent of boot state
 *   - boot convergence is derived from system state, not from tick timing
 *   - if auth resolves between ticks, the next tick's reconciliation catches it
 *
 * systemReady is derived automatically inside setKernelReady when authReady is true.
 */
function reconcileBootState(): void {
  const boot = useBootGate.getState();

  // Only declare kernel ready if:
  //   1. Kernel has produced at least one valid output (hasExecuted)
  //   2. Auth is already established (identity truth precedes computation truth)
  //   3. We haven't already declared kernel ready
  if (hasExecuted && boot.authReady && !boot.kernelReady) {
    boot.setKernelReady(true);
    // systemReady is set automatically inside setKernelReady
  }
}

/**
 * The heartbeat of the deterministic economic runtime.
 */
function runTick() {
  if (isRunningTick) {
    console.warn('[Kernel] Overlapping tick detected. Skipping to maintain single-threaded determinism.');
    return;
  }

  isRunningTick = true;
  // Runtime boundary timestamp (provided by environment once)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const currentTimestamp = Date.now(); // The only place Date.now() is allowed


  try {
    executeRuntimeTick(currentTimestamp);
    // Mark execution — independent of boot state
    hasExecuted = true;
  } catch (error) {
    console.error('[Kernel] Fatal error during runtime tick:', error);
    // hasExecuted stays false on error — kernel is not considered ready
  } finally {
    isRunningTick = false;
  }

  // Reconcile after every tick, whether or not this was the first.
  // If auth wasn't ready before but is now, this call closes the gate.
  reconcileBootState();
}

export function startEconomicKernel() {
  if (intervalId) return;
  console.log('[Kernel] Starting Deterministic Economic Runtime');
  intervalId = setInterval(runTick, TICK_INTERVAL_MS);
}

export function stopEconomicKernel() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Kernel] Stopped Economic Runtime');
  }
}
