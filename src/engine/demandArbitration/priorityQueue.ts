import { DemandCluster } from '@/types/demand';
import { OpportunityEntity } from '@/types/marketplace';
import { SupplySignal } from '@/types/supply';
import { evaluatePhaseTransition } from '../phaseTransition';
import { computeSkillScarcity } from './scarcity';
import { TickIdGenerator } from '@/engine/kernel/deterministicId';

const MAX_COLLAPSES_PER_TICK = 3;

interface ArbitrationResult {
  updatedClusters: DemandCluster[];
  newOpportunities: OpportunityEntity[];
}

/**
 * Arbitrates clusters, computes suppression and priority, and collapses top-K.
 * Introduces matchTension = demandPressure - supplyElasticity.
 */
export function processCollapseQueue(
  clusters: DemandCluster[],
  availableSupply: SupplySignal[],
  trustDensityMap: Record<string, number> = {}, // Mock mapping area to local trust density
  getSupplyElasticityForCategory: (category: string) => number = () => 0.5, // Default elasticity
  now: number = 0,
  idGen?: TickIdGenerator
): ArbitrationResult {
  const newOpportunities: OpportunityEntity[] = [];
  const updatedClusters: DemandCluster[] = [];

  // 1. Score and Suppress
  for (const cluster of clusters) {
    if (cluster.state === 'collapsed') {
      updatedClusters.push(cluster);
      continue;
    }

    const scarcity = computeSkillScarcity(cluster.category);

    // Urgency weight translates velocity to importance
    const urgencyWeight = 1.0 + cluster.velocity;

    // High trust density areas resolve demand faster
    const trustAmplifier = trustDensityMap[cluster.centroid.label || 'Unknown'] || 1.0;

    // The core equation: priorityScore = demandPressure * urgencyWeight * trustAmplifier / requiredSkillScarcity
    const rawPriority = (cluster.pressure * urgencyWeight * trustAmplifier) / scarcity;
    cluster.priorityScore = rawPriority;

    // 2. Supply Elasticity & Match Tension
    const elasticity = getSupplyElasticityForCategory(cluster.category);
    const matchTension = cluster.pressure - elasticity;

    // Negative tension -> oversupply -> suppresses cluster
    // Positive tension -> shortage -> amplifies pressure
    const tensionMultiplier = matchTension > 0 ? 1 + (matchTension * 0.5) : Math.max(0, 1 + matchTension);

    // Suppression logic (Overload constraint)
    // If scarcity is very high or trust density is very low, the cluster is suppressed.
    cluster.suppressionFactor = Math.max(0, scarcity - 0.5) * 1.5;

    const effectivePressure = cluster.pressure * tensionMultiplier * (1 - cluster.suppressionFactor);

    updatedClusters.push({ ...cluster, pressure: effectivePressure });
  }

  // 2. Sort Queue (Highest priority first)
  updatedClusters.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

  // 3. Phase Transition Loop (Top-K Evaluation)
  let evaluationCount = 0;

  for (let i = 0; i < updatedClusters.length; i++) {
    const cluster = updatedClusters[i];
    if (cluster.state === 'collapsed') continue;

    if (evaluationCount < MAX_COLLAPSES_PER_TICK) {
      // Find candidate supply signals (matching category)
      const candidateSupplies = availableSupply.filter(
        s => s.capability.toLowerCase() === cluster.category.toLowerCase()
      );

      for (const supply of candidateSupplies) {
        // Mock trust proximity (in prod this would be calculated from Trust Graph)
        const trustProximity = 0.8;
        const skillMatch = 1.0;
        const locationFit = 0.9;
        const elasticity = getSupplyElasticityForCategory(cluster.category);

        const phaseResult = evaluatePhaseTransition({
          demandPressure: cluster.pressure,
          supplyElasticity: elasticity,
          trustProximity,
          skillMatch,
          locationFit,
          cluster,
          supply,
          now,
          idGen: idGen!,
        });

        if (phaseResult) {
          evaluationCount++; // Count as an evaluation attempt

          if (phaseResult.event.state === "LOCKED" && phaseResult.lockedOpportunity) {
            cluster.state = "collapsed"; // Mark cluster as consumed
            newOpportunities.push(phaseResult.lockedOpportunity);
            break; // Stop evaluating supply for this cluster once locked
          }
        }
      }
    }
  }

  return { updatedClusters, newOpportunities };
}
