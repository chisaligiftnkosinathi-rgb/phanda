export type DemandSignalSource = 
  | 'search' 
  | 'failed-match' 
  | 'repeated-view' 
  | 'trust-gap' 
  | 'manual';

export interface DemandSignal {
  id: string;

  // WHAT is needed (latent intent, not explicit job post)
  category: string; 

  // WHERE it is emerging
  location: {
    lat?: number;
    lng?: number;
    label?: string;
  };

  // SIGNAL STRENGTH
  intensity: number; // 0-1 (how urgent/strong the need is)
  
  // CONFIDENCE (how certain the system is this is real demand)
  confidence: number; // 0-1
  
  // TIME PRESSURE
  decayRate: number; // how fast this need disappears

  // SOURCES (what created this signal)
  sources: DemandSignalSource[];

  lastUpdated: string;

  // Lifecycle tracking
  status: 'active' | 'collapsed';
  collapsedAt?: string;
  collapsedOpportunityId?: string;
}

export interface DemandField {
  signals: DemandSignal[];
  clusters: DemandCluster[];
}

export type ClusterVisibilityState = 
  | "invisible" 
  | "ghost" 
  | "emerging" 
  | "critical" 
  | "collapsed";

export interface DemandCluster {
  id: string;
  category: string;
  
  signals: string[]; // DemandSignal IDs

  centroid: {
    lat?: number;
    lng?: number;
    label?: string;
  };

  totalIntensity: number;
  totalConfidence: number;

  velocity: number; // how fast demand is growing
  pressure: number; // final computed field value

  // Arbitration metrics
  suppressionFactor: number; // 0.0 to 1.0 (Backlog/low capacity delay)
  priorityScore: number;     // Rank in the collapse queue

  state: ClusterVisibilityState;

  lastUpdated: string;
}
