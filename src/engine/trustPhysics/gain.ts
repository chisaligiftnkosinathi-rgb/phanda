import { TrustEvent } from './types';
import { TrustField } from '@/types/marketplace';

export function calculateGain(event: TrustEvent, currentField: TrustField): number {
  let baseImpact = 0;

  switch (event.type) {
    case 'ACTION_COMPLETED':
      baseImpact = 15;
      break;
    case 'EVIDENCE_ADDED':
      baseImpact = 5;
      break;
    default:
      return 0;
  }

  // Consistency bonus: If stability is high, gains are slightly accelerated (up to 1.5x)
  const consistencyBonus = 1 + (currentField.stability * 0.5);

  return baseImpact * consistencyBonus;
}
