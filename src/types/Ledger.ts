import { Observation } from "./Observation";

export interface Ledger {
  version: number;
  observations: Observation[];
}
