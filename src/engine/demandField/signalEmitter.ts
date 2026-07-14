import { TickIdGenerator, toISOFromTick } from '@/engine/kernel/deterministicId';
import { DemandSignal, DemandSignalSource } from '@/types/demand';

interface EmitSignalInput {
  category: string;
  locationLabel: string;
  intensity: number;
  confidence: number;
  source: DemandSignalSource;
}

/**
 * Deterministic signal emitter:
 * merges or creates demand signals based on category + location.
 */
export function emitDemandSignal(
  activeSignals: DemandSignal[],
  input: EmitSignalInput,
  currentTimestamp: number,
  idGen: TickIdGenerator
): DemandSignal[] {
  const nowISO = toISOFromTick(currentTimestamp);

  const existingIndex = activeSignals.findIndex((s) => {
    return (
      s.status === 'active' &&
      s.category === input.category &&
      s.location?.label === input.locationLabel
    );
  });

  if (existingIndex >= 0) {
    const existing = activeSignals[existingIndex];

    const newIntensity = Math.min(
      1.0,
      existing.intensity + input.intensity * 0.5
    );

    const newConfidence = Math.min(
      1.0,
      existing.confidence + input.confidence * 0.3
    );

    const existingSources = existing.sources ?? [];

    const newSources = Array.from(
      new Set([...existingSources, input.source])
    );

    const updatedSignal: DemandSignal = {
      ...existing,
      intensity: newIntensity,
      confidence: newConfidence,
      sources: newSources,
      lastUpdated: nowISO,
    };

    const updated = [...activeSignals];
    updated[existingIndex] = updatedSignal;
    return updated;
  }

  const newSignal: DemandSignal = {
    id: idGen.next('signal'),
    category: input.category,
    location: { label: input.locationLabel },
    intensity: input.intensity,
    confidence: input.confidence,
    decayRate: 0.1,
    sources: [input.source],
    lastUpdated: nowISO,
    status: 'active',
  };

  return [...activeSignals, newSignal];
}
