import { create } from 'zustand';
import { useAnimationStore } from './useAnimationStore';

export type AuthBridgeState = 
  | 'IDLE' 
  | 'TRIGGERED' 
  | 'AWAITING_AUTH_METHOD' 
  | 'COLLECTING_MINIMAL_IDENTITY'
  | 'AUTHENTICATING' 
  | 'CONFIRMING_ACTION' 
  | 'RESUMING_INTENT' 
  | 'COMPLETE';

export type PendingAction = {
  run: () => void;
  context: any;
  returnPath: string;
  label: string;
};

interface AuthBridgeStore {
  state: AuthBridgeState;
  pendingAction: PendingAction | null;

  trigger: (action: PendingAction) => void;
  setState: (state: AuthBridgeState) => void;
  cancel: () => void;
  resolveAuth: () => void;
  complete: () => void;
}

export const useAuthBridgeStore = create<AuthBridgeStore>((set, get) => ({
  state: 'IDLE',
  pendingAction: null,

  trigger: (action) => set({ 
    state: 'TRIGGERED', 
    pendingAction: action 
  }),

  setState: (state) => set({ state }),

  cancel: () => set({ 
    state: 'IDLE', 
    pendingAction: null 
  }),

  resolveAuth: () => {
    // Auth succeeded, transition to executing the action
    set({ state: 'CONFIRMING_ACTION' });
    const { pendingAction } = get();
    if (pendingAction) {
      pendingAction.run();
      if (pendingAction.context?.entityId) {
        useAnimationStore.getState().triggerResume(pendingAction.context.entityId);
      }
    }
    set({ state: 'RESUMING_INTENT' });
  },

  complete: () => set({ 
    state: 'COMPLETE', 
    pendingAction: null 
  }),
}));
