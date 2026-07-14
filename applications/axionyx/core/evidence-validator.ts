import { AnalyzeTraceRequest, EvidenceValidationError } from "./types";

export function validateEvidence(request: Partial<AnalyzeTraceRequest> | any): EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  if (!request || typeof request !== 'object') {
    return [{ path: "request", expected: "object", actual: typeof request }];
  }

  if (typeof request.traceId !== 'string') {
    errors.push({ path: "traceId", expected: "string", actual: typeof request.traceId });
  }

  if (!request.dataSource || typeof request.dataSource !== 'object') {
    errors.push({ path: "dataSource", expected: "object", actual: typeof request.dataSource });
    return errors; // Cannot proceed deeper
  }

  if (!Array.isArray(request.dataSource.auditLog)) {
    errors.push({ path: "dataSource.auditLog", expected: "Array", actual: typeof request.dataSource.auditLog });
  }

  const identityGraph = request.dataSource.identityGraph;
  if (!identityGraph || typeof identityGraph !== 'object') {
    errors.push({ path: "dataSource.identityGraph", expected: "object", actual: typeof identityGraph });
  } else {
    if (!Array.isArray(identityGraph.persons)) {
      errors.push({ path: "dataSource.identityGraph.persons", expected: "Array", actual: typeof identityGraph.persons });
    }
    if (!Array.isArray(identityGraph.memberships)) {
      errors.push({ path: "dataSource.identityGraph.memberships", expected: "Array", actual: typeof identityGraph.memberships });
    }
    if (!Array.isArray(identityGraph.roles)) {
      errors.push({ path: "dataSource.identityGraph.roles", expected: "Array", actual: typeof identityGraph.roles });
    }
  }

  return errors;
}
