import { EvidenceItem } from '@/types/marketplace';

export type TrustEvent = {
  type: 'ACTION_COMPLETED' | 'ACTION_FAILED' | 'EVIDENCE_ADDED' | 'SYSTEM_DECAY';
  actorId: string;
  targetId?: string;
  evidence?: EvidenceItem;
  timestamp: number;
};
