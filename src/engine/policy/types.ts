export type PolicyLevel =
  | "NORMAL"
  | "THROTTLE"
  | "RESTRICT"
  | "EMERGENCY_FREEZE";

export interface PolicyState {
  timestamp: number;

  systemRisk: number;        // 0.0 to 1.0 (instability of economy)
  loadFactor: number;        // derived from backpressure
  fraudRisk: number;         // trust anomaly detection proxy
  supplyStress: number;      // shortage pressure
  demandOverheat: number;    // cluster explosion tendency
  forecastConfidence: number;// aggregate confidence of shadow simulation

  interventionLevel: PolicyLevel;
}

export type GatekeeperAction = "ALLOW" | "DEFER" | "DROP";

export type GatekeeperReason =
  | "OK"
  | "SYSTEM_OVERLOAD"
  | "FORECAST_RISK"
  | "LOW_TRUST"
  | "POLICY_FREEZE";

export interface GatekeeperResult {
  allowed: boolean;
  action: GatekeeperAction;
  reasonCode: GatekeeperReason;
}
