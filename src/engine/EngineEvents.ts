/**
 * Strong types for all events emitted by the General Observation Engine.
 */
export type EngineEventMap = {
  ObservationCaptured: { observationId: string };
  TimelineUpdated: void; // Emitted whenever the timeline changes
  SyncStarted: void;
  SyncProgress: { pendingCount: number };
  SyncCompleted: void;
  SyncFailed: { error: string };
};

type EventName = keyof EngineEventMap;
type EventHandler<T> = (payload: T) => void;

/**
 * A simple, zero-dependency, strongly-typed event emitter.
 * Ensures the engine remains decoupled from Node's 'events' module or UI-specific state.
 */
export class EngineEventEmitter {
  private listeners: { [K in EventName]?: Set<EventHandler<any>> } = {};

  on<K extends EventName>(event: K, handler: EventHandler<EngineEventMap[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    (this.listeners[event] as Set<EventHandler<EngineEventMap[K]>>).add(handler);

    // Return an unsubscribe function
    return () => {
      (this.listeners[event] as Set<EventHandler<EngineEventMap[K]>>)?.delete(handler);
    };
  }

  emit<K extends EventName>(event: K, payload: EngineEventMap[K]): void {
    const handlers = this.listeners[event] as Set<EventHandler<EngineEventMap[K]>> | undefined;
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (e) {
          console.error(`Error in event handler for ${event}:`, e);
        }
      });
    }
  }
}