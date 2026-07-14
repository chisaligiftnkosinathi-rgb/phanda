// ==========================================
// AXIONYX v0 - Formal IO Contract
// ==========================================

export type AuditLogEntry = {
  eventId: string;
  traceId: string;
  actorId: string;
  action: string;
  targetResource: string;
  timestamp: string;
  sourceLayer: string;
  domain: string;
};

export type IdentitySnapshot = {
  timestamp: string;
  persons: Array<{
    personId: string;
    authUserId: string;
  }>;
  memberships: Array<{
    personId: string;
    organizationId: string;
    roleId: string;
    validFrom: string;
    validTo?: string;
  }>;
  roles: Array<{
    roleId: string;
    permissions: Array<{
      action: string;
      resource: string;
    }>;
  }>;
};

export type TrustEvidence = {
  id: string;
  targetId: string;
  targetType: "person" | "organization";
  evidenceType: string;
  status: string;
  issuedAt: string;
  expiresAt?: string;
};

export type AnalyzeTraceRequest = {
  traceId: string;
  dataSource: {
    auditLog: AuditLogEntry[];
    identityGraph: IdentitySnapshot;
    trustEvidence?: TrustEvidence[];
  };
  options?: {
    strictMode?: boolean;
    includeGraph?: boolean;
  };
};

// ==========================================
// Interpretation Ontology
// ==========================================

export type MembershipSnapshot = {
  organizationId: string;
  roleId: string;
};

export type RoleSnapshot = {
  roleId: string;
};

export type PermissionSnapshot = {
  action: string;
  resource: string;
};

export type ContextFrame = {
  eventId: string;
  traceId: string;
  timestamp: string;
  actorId: string;
  activeMemberships: MembershipSnapshot[];
  activeRoles: RoleSnapshot[];
  activePermissions: PermissionSnapshot[];
  activeTrustEvidence: TrustEvidence[];
  resolutionStatus: "RESOLVED" | "ACTOR_NOT_FOUND" | "AMBIGUOUS" | "INSUFFICIENT_HISTORY";
};

export type Fact = AuditLogEntry;

export type Sequence = {
  traceId: string;
  nodes: Fact[];
};

export type CausalGraph = {
  nodes: Fact[];
  edges: Array<{
    fromEventId: string;
    toEventId: string;
    relation: "PRECONDITION_SATISFIED" | "VIOLATES_CAUSAL_RULE";
  }>;
};

export type AssertionOutcome = "PASS" | "FAIL" | "UNKNOWN";

export type AssertionDefinition = {
  assertionId: string;
  type: string;
  evaluator: string;
  version: string;
  family: "EVIDENCE" | "GOVERNANCE" | "CONSISTENCY";
};

export type AssertionConfig = {
  assertionId: string;
  params?: Record<string, any>;
};

export type GovernanceRule = {
  ruleId: string;
  action: string;
  assertions: AssertionConfig[];
  version: string;
};

export type KnowledgeSet = {
  knowledgeSetVersion: string;
  ontologyVersion: string;
  assertionLibrary: AssertionDefinition[];
  ruleSet: GovernanceRule[];
};

export type AssertionResult = {
  assertionType: string;
  outcome: AssertionOutcome;
  context?: string; // e.g., "Missing manage:organization permission"
};

export type RuleOutcome = "PASS" | "FAIL" | "INDETERMINATE";

export type RuleEvaluationResult = {
  ruleId: string;
  factId: string;
  outcome: RuleOutcome;
  assertions: AssertionResult[];
};

export type AnomalyFamily = "EVIDENCE" | "GOVERNANCE" | "CONSISTENCY";

export type AnomalyType = 
  | "ACTOR_NOT_FOUND"       // EVIDENCE
  | "INSUFFICIENT_HISTORY"  // EVIDENCE
  | "ORPHANED_TRACE"        // EVIDENCE
  | "MISSING_ANTECEDENT"    // GOVERNANCE
  | "PRIVILEGE_GAP"         // GOVERNANCE
  | "TEMPORAL_VIOLATION"    // CONSISTENCY
  | "DUPLICATE_FACT"        // CONSISTENCY
  | "CONFLICTING_FACT";     // CONSISTENCY

export type Anomaly = {
  family: AnomalyFamily;
  type: AnomalyType;
  eventId?: string;
  description: string;
};

export type Interpretation = {
  verdict: "COHERENT" | "COMPROMISED";
  metrics: {
    evidenceCompleteness: number; // 0-100
    governanceCompliance: number; // 0-100
    logicalConsistency: number;   // 0-100
    determinismScore: number;     // 0-100
  };
  supportingProof: RuleEvaluationResult[];
  anomalies: Anomaly[];
};

export type AnalyzeTraceResult = {
  traceId: string;
  interpretation: Interpretation;
  sequence: Sequence;
  causalGraph?: CausalGraph;
  contextFrames: ContextFrame[];
};

export type EvidenceValidationError = {
  path: string;
  expected: string;
  actual: string;
};

export type AnalyzeTraceResponse = 
  | {
      status: "SUCCESS";
      data: AnalyzeTraceResult;
    }
  | {
      status: "INVALID_EVIDENCE";
      errors: EvidenceValidationError[];
    };
