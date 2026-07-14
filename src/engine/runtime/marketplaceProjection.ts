import { useMemo } from 'react';
import { EngineSnapshotView } from '@/engine/runtime/types';
import { MarketplaceEntity, OpportunityEntity, PersonEntity, GhostEntity } from '@/types/marketplace';
import { DemandCluster } from '@/types/demand';
import { SupplySignal } from '@/types/supply';
import { TrustEdge } from '@/types/trustGraph';
import { ForecastTick } from '@/engine/forecast/types';

// ---------------------------------------------------------------------------
// Engine → MarketplaceEntity projection layer.
//
// This is the ONLY place where EngineSnapshotView is translated into
// the presentation types that MarketplaceCard renders.
//
// The UI layer stays unchanged. The engine output becomes the data source.
// ---------------------------------------------------------------------------

function deriveTrustValue(personId: string, trustEdges: TrustEdge[]): number {
  const edge = trustEdges.find(e => e.toEntityId === personId);
  if (!edge) return 50;
  return Math.round(edge.weight * 100);
}

function deriveAnchorClass(value: number): 'UNSTABLE' | 'EMERGING' | 'RELIABLE' | 'PROVEN' | 'ANCHOR' {
  if (value >= 90) return 'ANCHOR';
  if (value >= 75) return 'PROVEN';
  if (value >= 55) return 'RELIABLE';
  if (value >= 35) return 'EMERGING';
  return 'UNSTABLE';
}

export function projectSupplySignalToPersonEntity(
  signal: SupplySignal,
  trustEdges: TrustEdge[]
): PersonEntity {
  const trustValue = deriveTrustValue(signal.personId, trustEdges);

  return {
    identity: {
      id: signal.id,
      variant: 'person',
      title: signal.capability,
      subtitle: signal.location.label,
    },
    visibility: {
      location: signal.location.label ?? 'Unknown',
      activeStatus: signal.availability > 0.6 ? 'Available now' : 'Limited availability',
    },
    evidence: {
      completedCount: 0,
      verificationLevel: Math.round(signal.trustStability * 5),
    },
    trustField: {
      value: trustValue,
      velocity: 0,
      acceleration: 0,
      stability: signal.trustStability,
      lastUpdated: signal.lastUpdated,
      anchorClass: deriveAnchorClass(trustValue),
    },
    variantData: {
      capabilities: [signal.capability],
      availability: signal.availability > 0.6 ? 'Available' : 'Busy',
    },
  };
}

export function projectDemandClusterToOpportunityEntity(
  cluster: DemandCluster,
  forecastTicks: ForecastTick[]
): OpportunityEntity {
  // Check if this cluster has a high-confidence projection
  const hasForecast = forecastTicks.some(
    t => t.projectedOpportunities.some(o => o.variantData?.originDemandSignalId?.includes(cluster.id))
  );

  return {
    identity: {
      id: cluster.id,
      variant: 'opportunity',
      title: `${cluster.category} needed`,
      subtitle: cluster.centroid.label ?? 'Nearby',
    },
    visibility: {
      location: cluster.centroid.label ?? 'Nearby',
      activeStatus: cluster.state === 'critical' ? 'High demand' : 'Active',
    },
    evidence: {
      completedCount: cluster.signals.length,
      verificationLevel: Math.round(cluster.totalConfidence * 5),
    },
    trustField: {
      value: Math.round(cluster.pressure * 100),
      velocity: cluster.velocity,
      acceleration: 0,
      stability: 1 - cluster.suppressionFactor,
      lastUpdated: cluster.lastUpdated,
      anchorClass: deriveAnchorClass(Math.round(cluster.pressure * 100)),
    },
    variantData: {
      requiredAbilities: [cluster.category],
      urgency: cluster.pressure > 0.7 ? 'HIGH' : cluster.pressure > 0.4 ? 'MEDIUM' : 'LOW',
      createdAt: cluster.lastUpdated,
      emergenceType: 'collapse',
      originDemandSignalId: cluster.signals[0],
    },
  };
}

export function projectDemandClusterToGhostEntity(cluster: DemandCluster): GhostEntity {
  return {
    identity: {
      id: `ghost_${cluster.id}`,
      variant: 'ghost',
      title: `${cluster.category} — Likely to emerge`,
      subtitle: cluster.centroid.label ?? 'Nearby',
    },
    visibility: {
      location: cluster.centroid.label ?? 'Nearby',
      activeStatus: 'Demand increasing',
    },
    clusterState: cluster.state === 'critical' ? 'critical' : 'ghost',
    pressure: cluster.pressure,
    category: cluster.category,
    suppressionFactor: cluster.suppressionFactor,
  };
}

/**
 * Main projection function — takes EngineSnapshotView and returns
 * the exact MarketplaceEntity[] the existing MarketplaceCard renders.
 */
export function projectEngineViewToMarketplaceFeed(
  view: EngineSnapshotView,
  intent: 'find-work' | 'find-people' | 'explore',
  categoryFilter?: string,
  cityFilter?: string,
): MarketplaceEntity[] {
  const entities: MarketplaceEntity[] = [];

  // People (from SupplySignals)
  if (intent !== 'find-work') {
    const people = view.supplySignals
      .filter(s => !categoryFilter || s.capability === categoryFilter)
      .map(s => projectSupplySignalToPersonEntity(s, view.trustEdges));
    entities.push(...people);
  }

  // Opportunities (from DemandClusters that have collapsed)
  if (intent !== 'find-people') {
    const opportunities = view.demandClusters
      .filter(c => c.state === 'collapsed')
      .filter(c => !categoryFilter || c.category === categoryFilter)
      .map(c => projectDemandClusterToOpportunityEntity(c, view.forecast.ticks));
    entities.push(...opportunities);

    // Ghost entities (emerging clusters — not yet collapsed)
    const ghosts = view.demandClusters
      .filter(c => c.state === 'ghost' || c.state === 'emerging' || c.state === 'critical')
      .filter(c => !categoryFilter || c.category === categoryFilter)
      .map(c => projectDemandClusterToGhostEntity(c));
    entities.push(...ghosts);
  }

  return entities;
}
