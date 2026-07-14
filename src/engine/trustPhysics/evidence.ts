import { TrustEvent } from './types';

export function calculateEvidenceMultiplier(event: TrustEvent): number {
  if (!event.evidence) return 1.0;

  let multiplier = 1.0;

  switch (event.evidence.type) {
    case 'photo':
      // Before & After photo is the strongest evidence
      if (event.evidence.beforeUri && event.evidence.afterUri) {
        multiplier = 2.0;
      } else {
        multiplier = 1.5;
      }
      break;
    case 'video':
      multiplier = 2.0;
      break;
    case 'document':
      multiplier = 1.2;
      break;
  }

  if (event.evidence.verified) {
    multiplier += 0.2; // Extra bonus for verified evidence
  }

  return multiplier;
}
