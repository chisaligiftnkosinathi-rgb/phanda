import { SystemSnapshot } from '@/engine/kernel/snapshot';
import { DemandCluster } from '@/types/demand';
import { SupplySignal } from '@/types/supply';
import { OpportunityEntity } from '@/types/marketplace';
import { PhaseEvent } from '@/types/phaseTransition';
import { TrustEdge } from '@/types/trustGraph';
import { ForecastTick } from '@/engine/forecast/types';
import { PolicyState } from '@/engine/policy/types';
import { DecisionRecord } from '@/engine/explainability/types';

// ---------------------------------------------------------------------------
// EngineSnapshotView — the unified, read-only output stream that the UI consumes.
//
// RULE: The UI may ONLY import this type. It may NEVER import:
//   - src/repositories/*
//   - src/api/*
//   - src/engine/kernel/store
//   - src/mocks/*
//
// All UI components subscribe to this via useEconomicKernel().
// ---------------------------------------------------------------------------

export type PolicyLevelUI = 'NORMAL' | 'THROTTLE' | 'RESTRICT' | 'EMERGENCY_FREEZE';

export interface EngineSnapshotView {
  // Core physics state
  supplySignals: SupplySignal[];
  demandClusters: DemandCluster[];
  trustEdges: TrustEdge[];
  opportunities: OpportunityEntity[];
  phaseTransitions: PhaseEvent[];

  // Forecast layer
  forecast: {
    ticks: ForecastTick[];
    horizonTicks: number;
  };

  // Governance
  policy: PolicyState;
  policyLevel: PolicyLevelUI;

  // Audit
  recentDecisions: DecisionRecord[];

  // Runtime metadata
  lastTickTimestamp: number;
  tickId: string;
  snapshotHash: string;
  isLoading: boolean;
  error: string | null;
}

// Sensible defaults for the initial (pre-boot) state
export const EMPTY_ENGINE_VIEW: EngineSnapshotView = {
  supplySignals: [],
  demandClusters: [],
  trustEdges: [],
  opportunities: [],
  phaseTransitions: [],
  forecast: { ticks: [], horizonTicks: 3 },
  policy: {
    timestamp: 0,
    systemRisk: 0,
    loadFactor: 1,
    fraudRisk: 0,
    supplyStress: 0,
    demandOverheat: 0,
    forecastConfidence: 1,
    interventionLevel: 'NORMAL',
  },
  policyLevel: 'NORMAL',
  recentDecisions: [],
  lastTickTimestamp: 0,
  tickId: '',
  snapshotHash: '',
  isLoading: true,
  error: null,
};
