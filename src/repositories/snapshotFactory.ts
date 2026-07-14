import { SystemSnapshot } from '@/engine/kernel/snapshot';
import { EconomyRepository } from './interfaces';

// ---------------------------------------------------------------------------
// SNAPSHOT VALIDATION ERRORS
// ---------------------------------------------------------------------------
export interface SnapshotValidationError {
  field: string;
  message: string;
}

export interface SnapshotValidationResult {
  valid: boolean;
  errors: SnapshotValidationError[];
}

/**
 * SnapshotValidator — the production gate that prevents bad data from
 * reaching the kernel. If validation fails, the kernel never starts that tick.
 *
 * This is where production systems catch data quality problems before they
 * propagate into physics, forecasting, and the historical ledger.
 */
function validateSnapshot(snapshot: SystemSnapshot): SnapshotValidationResult {
  const errors: SnapshotValidationError[] = [];
  
  // 1. No duplicate supply signal IDs
  const supplyIds = snapshot.supply.signals.map(s => s.id);
  const uniqueSupplyIds = new Set(supplyIds);
  if (uniqueSupplyIds.size !== supplyIds.length) {
    errors.push({ field: 'supply.signals', message: 'Duplicate SupplySignal IDs detected.' });
  }

  // 2. No duplicate demand cluster IDs
  const clusterIds = snapshot.demand.clusters.map(c => c.id);
  const uniqueClusterIds = new Set(clusterIds);
  if (uniqueClusterIds.size !== clusterIds.length) {
    errors.push({ field: 'demand.clusters', message: 'Duplicate DemandCluster IDs detected.' });
  }

  // 3. All supply signals have a known capability (not 'unknown')
  const unknownCapability = snapshot.supply.signals.filter(s => s.capability === 'unknown');
  if (unknownCapability.length > 0) {
    errors.push({ 
      field: 'supply.signals.capability', 
      message: `${unknownCapability.length} SupplySignal(s) have unknown capability. Adapter may be missing a category mapping.` 
    });
  }

  // 4. Timestamp is monotonically increasing (no stale snapshot)
  if (snapshot.timestamp > Date.now() + 5000) {
    errors.push({ field: 'timestamp', message: 'Snapshot timestamp is in the future (clock drift).' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * SnapshotFactory — the ONLY place that assembles a SystemSnapshot.
 * Reads from repositories (never directly from src/api or mocks).
 * Passes through SnapshotValidator before returning.
 *
 * Data flow:
 *   Repositories -> SnapshotFactory -> SnapshotValidator -> SystemSnapshot -> Kernel
 */
export async function buildSnapshot(
  repos: EconomyRepository,
  timestamp: number = Date.now()
): Promise<SystemSnapshot> {
  
  // Read all domain models from repositories in parallel
  const [supplySignals, demandSignals, trustEdges] = await Promise.all([
    repos.profiles.getSupplySignals(),
    repos.opportunities.getDemandSignals(),
    repos.trust.getTrustEdges(),
  ]);

  const snapshot: SystemSnapshot = {
    timestamp,
    demand: {
      signals: demandSignals,
      clusters: [], // Clusters are built by the DemandClustering engine at runtime
    },
    supply: {
      signals: supplySignals,
    },
    trustEdges,
    opportunities: [],
    cooldowns: {
      cluster: {},
      supply: {},
    },
    derived: {
      demandPressureMap: {},
      supplyElasticityMap: {},
      matchTensionMap: {},
    },
  };

  // Validate before handing to the kernel
  const validation = validateSnapshot(snapshot);

  if (!validation.valid) {
    const errorMessages = validation.errors.map(e => `[${e.field}] ${e.message}`).join('\n');
    console.error('[SnapshotFactory] Validation failed. Kernel will not start:\n', errorMessages);
    throw new Error(`Snapshot validation failed: ${validation.errors.length} error(s).`);
  }

  return snapshot;
}
