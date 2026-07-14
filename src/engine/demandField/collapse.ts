import { TickIdGenerator, toISOFromTick } from '@/engine/kernel/deterministicId';
import { DemandCluster } from '@/types/demand';
import { OpportunityEntity } from '@/types/marketplace';
import { computeClusterPhysics } from '../demandClustering/clusterPhysics';

export const COLLAPSE_PRESSURE_THRESHOLD = 0.65;

interface CollapseResult {
  collapsedCluster: DemandCluster;
  generatedOpportunity: OpportunityEntity;
}

/**
 * Deterministic collapse engine:
 * Converts high-pressure demand clusters into opportunities.
 */
export function collapseClusterIntoOpportunity(
  cluster: DemandCluster,
  trustFieldAmplification: number,
  proximityCompression: number,
  currentTime: number,
  idGen: TickIdGenerator
): CollapseResult | null {
  if (cluster.state === 'collapsed') return null;

  const physics = computeClusterPhysics(
    cluster,
    trustFieldAmplification,
    proximityCompression
  );

  if (
    physics.pressure > COLLAPSE_PRESSURE_THRESHOLD &&
    physics.velocity > 0 &&
    trustFieldAmplification > 0.8
  ) {
    const oppId = idGen.next('opp');
    const nowISO = toISOFromTick(currentTime);

    const collapsedCluster: DemandCluster = {
      ...cluster,
      ...physics,
      state: 'collapsed',
      lastUpdated: nowISO,
    };

    const generatedOpportunity: OpportunityEntity = {
      identity: {
        id: oppId,
        variant: 'opportunity',
        title: `Need ${cluster.category}`,
        subtitle: 'Revealed from network demand cluster',
      },
      visibility: {
        location: cluster.centroid?.label ?? 'Unknown Area',
        activeStatus: 'Emerging',
      },
      evidence: {
        completedCount: 0,
        verificationLevel: 0,
      },
      trustField: {
        value: 65,
        velocity: 0.5,
        acceleration: 0,
        stability: 0.2,
        lastUpdated: nowISO,
        anchorClass: 'EMERGING',
      },
      variantData: {
        price: 'To be negotiated',
        urgency: physics.pressure > 0.8 ? 'HIGH' : 'MEDIUM',
        requiredAbilities: [cluster.category],
        createdAt: nowISO,
        emergenceType: 'collapse',
        originDemandSignalId: cluster.id,
      },
    };

    return { collapsedCluster, generatedOpportunity };
  }

  return null;
}
