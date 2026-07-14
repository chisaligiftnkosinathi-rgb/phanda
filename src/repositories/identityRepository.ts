/**
 * The deterministic identity of an actor within the kernel's current tick.
 * The kernel never imports authentication directly — only this interface.
 */
export interface IdentitySnapshot {
  actorId: string;
  stewardProfileId: string | null;
  role: 'steward' | 'seeker' | 'admin' | 'unknown';
  permissions: string[];
}
