import { DemandSignal } from '@/types/demand';
import { OpportunityEntity } from '@/types/marketplace';

export const mockDemandSignals: DemandSignal[] = [
  {
    id: "signal_001",
    category: "Plumbing",
    location: { label: "Pretoria East" },
    intensity: 0.85,
    confidence: 0.9,
    decayRate: 0.05,
    sources: ["failed-match", "repeated-view", "search"],
    lastUpdated: new Date().toISOString(),
    status: "active",
  },
  {
    id: "signal_002",
    category: "Generator Repair",
    location: { label: "Centurion" },
    intensity: 0.95,
    confidence: 0.99,
    decayRate: 0.1,
    sources: ["search", "search", "search"],
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    status: "collapsed",
    collapsedAt: new Date(Date.now() - 3600000).toISOString(),
    collapsedOpportunityId: "opp-emergent-1",
  }
];

export const mockEmergentOpportunities: OpportunityEntity[] = [
  {
    identity: {
      id: "opp-emergent-1",
      variant: "opportunity",
      title: "Need Generator Repair",
      subtitle: "Revealed from network demand",
    },
    visibility: {
      location: "Centurion",
      activeStatus: "Emerging",
    },
    evidence: {
      completedCount: 0,
      verificationLevel: 0,
    },
    trustField: {
      value: 50,
      velocity: 0,
      acceleration: 0,
      stability: 0.1,
      lastUpdated: new Date().toISOString(),
      anchorClass: 'EMERGING',
    },
    variantData: {
      price: "To be negotiated",
      urgency: "HIGH",
      requiredAbilities: ["Generator Repair"],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      emergenceType: "collapse",
      originDemandSignalId: "signal_002",
    }
  }
];

import { GhostEntity } from '@/types/marketplace';

export const mockGhostOpportunities: GhostEntity[] = [
  {
    identity: {
      id: "ghost-cluster-001",
      variant: "ghost",
      title: "Solar Installation",
      subtitle: "Demand Cluster",
    },
    visibility: {
      location: "Centurion",
      activeStatus: "Forming",
    },
    clusterState: "ghost",
    pressure: 0.42,
    category: "Solar Installation",
  },
  {
    identity: {
      id: "ghost-cluster-002",
      variant: "ghost",
      title: "Plumbing Repair",
      subtitle: "Demand Cluster",
    },
    visibility: {
      location: "Mamelodi East",
      activeStatus: "Suppressed",
    },
    clusterState: "emerging",
    pressure: 0.55,
    category: "Plumbing",
    suppressionFactor: 0.8, // Triggers "Delayed Fulfillment Zone"
  }
];
