export type VerificationPolicy = "shallow" | "deep" | "audit";

export interface ConfidenceReport {
  ledger: "VERIFIED" | "CORRUPTED";
  media: "VERIFIED" | "MISSING" | "CORRUPTED" | "UNVERIFIED";
  overall: "VERIFIED" | "PARTIAL" | "CORRUPTED";
}

export interface ReplayEvidence {
  mediaId: string;
  type: string;
  expectedChecksum: string;
  uri?: string;         // Populated if physically available
  isMissing: boolean;   // True if the physical file is gone entirely
  isCorrupted: boolean; // True ONLY if deep verification ran and checksum mismatched
}

export interface ReplayRecord {
  observationId: string;
  occurredAt: string;
  content: string;
  type: string;
  confidence: ConfidenceReport;
  evidence: ReplayEvidence[];
  metadata?: Record<string, unknown>;
}
