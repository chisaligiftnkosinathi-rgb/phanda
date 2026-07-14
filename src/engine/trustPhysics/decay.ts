import { TrustField } from '@/types/marketplace';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function calculateDecay(currentField: TrustField, currentTime: number): number {
  const lastUpdated = Date.parse(currentField.lastUpdated);

  const timeDiffMs = currentTime - lastUpdated;

  if (timeDiffMs <= 0) return 0;

  const daysInactive = timeDiffMs / MS_PER_DAY;

  // Logarithmic decay: decays fast initially, then slows down.
  // We offset by +1 so Math.log10(1) = 0 decay on day 0
  const baseDecay = Math.log10(daysInactive + 1) * 2;

  // High stability users decay slower
  const stabilityDampener = 1 - (currentField.stability * 0.5); // max 50% reduction in decay

  return baseDecay * stabilityDampener;
}
