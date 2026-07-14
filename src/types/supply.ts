export interface SupplySignal {
  id: string;
  personId: string;
  capability: string;

  location: {
    lat?: number;
    lng?: number;
    label?: string;
  };

  capacity: number;        // 0-1 (how much work they can still take)
  availability: number;    // 0-1 (how free they are right now)
  responsiveness: number;  // 0-1 (how quickly they react)
  
  fatigue: number;         // 0-1 (inverse energy)
  drift: number;           // 0-1 (how disconnected from active work they are)

  trustStability: number;  // derived from TrustField.stability
  
  lastUpdated: string;
  lastActionCompletedAt?: string; // used for drift calculation
}

export interface SupplyField {
  signals: SupplySignal[];
  pressure: number;        // "work readiness pressure"
  elasticity: number;      // how much demand it can absorb
  volatility: number;      // instability in workforce
}
