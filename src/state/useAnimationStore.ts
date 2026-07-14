import { create } from 'zustand';

export type TrustResumeState = 
  | 'IDLE' 
  | 'FREEZE_LIST' 
  | 'ZOOM_ENTITY' 
  | 'CONFIRM_BIND' 
  | 'UNFREEZE';

interface AnimationStore {
  activeEntityId: string | null;
  stage: TrustResumeState;
  
  triggerResume: (entityId: string) => void;
  setStage: (stage: TrustResumeState) => void;
}

export const useAnimationStore = create<AnimationStore>((set) => ({
  activeEntityId: null,
  stage: 'IDLE',

  setStage: (stage) => set({ stage }),

  triggerResume: (entityId: string) => {
    // Start Sequence
    set({ activeEntityId: entityId, stage: 'FREEZE_LIST' });

    // Step A to B: Zoom Entity
    setTimeout(() => {
      set({ stage: 'ZOOM_ENTITY' });
    }, 200);

    // Step B to C: Confirm Bind (Pulse)
    setTimeout(() => {
      set({ stage: 'CONFIRM_BIND' });
    }, 500);

    // Step C to D: Reintegration (Unfreeze)
    setTimeout(() => {
      set({ stage: 'UNFREEZE' });
    }, 900);

    // Reset to IDLE, keeping the badge local state active on the card
    setTimeout(() => {
      set({ activeEntityId: null, stage: 'IDLE' });
    }, 1200);
  }
}));
