import { TickIdGenerator, toISOFromTick } from '@/engine/kernel/deterministicId';
import { DemandCluster } from '@/types/demand';
import { OpportunityEntity } from '@/types/marketplace';
import { PhaseEvent, PhaseState } from '@/types/phaseTransition';
import { SupplySignal } from '@/types/supply';

// ----------------------------------------------------------------------
// Rate Limiting Layer (Critical Stability System)
// ----------------------------------------------------------------------
const clusterCooldownMap = new Map<string, number>();
const supplyCooldownMap = new Map<string, number>();

const CLUSTER_COOLDOWN_MS = 60_000;
const SUPPLY_COOLDOWN_MS = 15_000;

function isClusterCoolingDown(id: string, now: number): boolean {
  const lastEval = clusterCooldownMap.get(id) || 0;
  return (now - lastEval) < CLUSTER_COOLDOWN_MS;
}

function isSupplyCoolingDown(id: string, now: number): boolean {
  const lastEval = supplyCooldownMap.get(id) || 0;
  return (now - lastEval) < SUPPLY_COOLDOWN_MS;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

// ----------------------------------------------------------------------
// Gating Rule
// ----------------------------------------------------------------------
function canEvaluate(cluster: DemandCluster, supply: SupplySignal, now: number): boolean {
  return (
    cluster.state !== "collapsed" &&
    cluster.pressure > 0.35 &&
    supply.capacity > 0.2 &&
    !isClusterCoolingDown(cluster.id, now) &&
    !isSupplyCoolingDown(supply.id, now)
  );
}

// ----------------------------------------------------------------------
// Reality Emission
// ----------------------------------------------------------------------
function emitOpportunity(
  cluster: DemandCluster,
  supply: SupplySignal,
  timestamp: string,
  idGen: TickIdGenerator
): OpportunityEntity {
  const oppId = idGen.next('opp_locked');

  return {
    identity: {
      id: oppId,
      variant: 'opportunity',
      title: `Need ${cluster.category}`,
      subtitle: 'Revealed from network demand cluster',
    },
    visibility: {
      location: cluster.centroid.label || 'Unknown Area',
      activeStatus: 'Active today',
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
      lastUpdated: timestamp,
      anchorClass: 'EMERGING',
    },
    variantData: {
      price: "To be negotiated",
      urgency: cluster.pressure > 0.8 ? "HIGH" : "MEDIUM",
      requiredAbilities: [cluster.category],
      createdAt: timestamp,
      emergenceType: "collapse",
      originDemandSignalId: cluster.id,
    }
  };
}

// ----------------------------------------------------------------------
// Core Phase Engine
// ----------------------------------------------------------------------

interface EvaluateTransitionParams {
  demandPressure: number;
  supplyElasticity: number;
  trustProximity: number;
  skillMatch: number;
  locationFit: number;
  cluster: DemandCluster;
  supply: SupplySignal;
  now: number; // Deterministic timestamp passed from Kernel snapshot
  idGen: TickIdGenerator; // Deterministic ID generator scoped to this tick
}

export interface PhaseTransitionResult {
  event: PhaseEvent;
  lockedOpportunity?: OpportunityEntity;
}


export function evaluatePhaseTransition(params: EvaluateTransitionParams): PhaseTransitionResult | null {
  const { demandPressure, supplyElasticity, trustProximity, skillMatch, locationFit, cluster, supply, now, idGen } = params;
  const timestamp = toISOFromTick(now);


  if (!canEvaluate(cluster, supply, now)) {
    return null;
  }

  // Record evaluation
  clusterCooldownMap.set(cluster.id, now);
  supplyCooldownMap.set(supply.id, now);

  // Tension Model
  let tension = demandPressure - supplyElasticity;
  tension = clamp(tension, -1, 1);

  // Alignment Score
  const alignment = clamp01(
    (trustProximity * 0.4) +
    (skillMatch * 0.3) +
    (locationFit * 0.2) +
    (supply.responsiveness * 0.1)
  );

  const decayRisk = supply.drift; // Using idle drift as risk factor

  // State Machine
  let state: PhaseState = "POTENTIAL";

  if (decayRisk > 0.6 || trustProximity < 0.3) {
    state = "FAILED";
  } else if (alignment > 0.8 && tension > 0.2) {
    state = "LOCKED";
  } else if (alignment > 0.65 && trustProximity > 0.6) {
    state = "COMMITTING";
  } else if (tension > 0 && alignment > 0.4) {
    state = "ALIGNING";
  }

  const phaseEvent: PhaseEvent = {
    id: idGen.next('phase'),
    clusterId: cluster.id,
    supplySignalId: supply.id,
    state,
    tension,
    trustAlignment: trustProximity,
    decayRisk,
    alignment,
    timestamp
  };

  let lockedOpportunity: OpportunityEntity | undefined = undefined;

  if (state === "LOCKED") {
    // Phase Reality Transition
    lockedOpportunity = emitOpportunity(cluster, supply, timestamp, idGen);
    // In actual implementation, we also emit a TrustEdge formation event here:
    // emitTrustEvent({ type: 'PHASE_TRANSITION_LOCKED', origin: ..., trustEdgeCreated: true });
  }

  return {
    event: phaseEvent,
    lockedOpportunity
  };
}
