import { 
  Fact, 
  IdentitySnapshot, 
  TrustEvidence, 
  ContextFrame, 
  MembershipSnapshot, 
  RoleSnapshot, 
  PermissionSnapshot 
} from './types';

/**
 * Resolves the historical context for a specific Fact.
 * Pure function: Deterministic, no database lookups, no assumptions.
 * Adheres to the Resolution Principle: Missing evidence is never inferred.
 * 
 * @param fact The immutable event node
 * @param identitySnapshot The state of the identity graph covering the event's timestamp
 * @param trustEvidence Optional trust claims covering the event's timestamp
 * @returns An immutable ContextFrame defining exactly what was true at the moment of the Fact.
 */
export function buildContextFrame(
  fact: Fact,
  identitySnapshot: IdentitySnapshot,
  trustEvidence: TrustEvidence[] = []
): ContextFrame {
  const { eventId, traceId, timestamp, actorId } = fact;

  // Initialize the empty frame
  const frame: ContextFrame = {
    eventId,
    traceId,
    timestamp,
    actorId,
    activeMemberships: [],
    activeRoles: [],
    activePermissions: [],
    activeTrustEvidence: [],
    resolutionStatus: "RESOLVED"
  };

  // 1. Resolve Person
  // To evaluate privilege, we must be able to link the actor to a known Person in the snapshot.
  const personRecord = identitySnapshot.persons.find(p => p.personId === actorId || p.authUserId === actorId);
  if (!personRecord) {
    frame.resolutionStatus = "ACTOR_NOT_FOUND";
    return frame; // Return immediately. We cannot resolve context for an unknown actor.
  }
  
  // Normalize the actor to the personId for membership lookups, in case the actorId was an authUserId
  const resolvedPersonId = personRecord.personId;

  // 2. Resolve Active Memberships
  // We must ensure the membership was valid AT the timestamp of the event.
  const eventTime = new Date(timestamp).getTime();
  const activeMemberships = identitySnapshot.memberships.filter(m => {
    if (m.personId !== resolvedPersonId) return false;
    
    const validFromTime = new Date(m.validFrom).getTime();
    if (validFromTime > eventTime) return false; // Membership started after the event

    if (m.validTo) {
      const validToTime = new Date(m.validTo).getTime();
      if (validToTime < eventTime) return false; // Membership ended before the event
    }

    return true;
  });

  frame.activeMemberships = activeMemberships.map(m => ({
    organizationId: m.organizationId,
    roleId: m.roleId
  }));

  // 3. Resolve Active Roles
  const activeRoleIds = new Set(frame.activeMemberships.map(m => m.roleId));
  frame.activeRoles = Array.from(activeRoleIds).map(roleId => ({ roleId }));

  // 4. Resolve Active Permissions
  const activePermissions: PermissionSnapshot[] = [];
  activeRoleIds.forEach(roleId => {
    const roleRecord = identitySnapshot.roles.find(r => r.roleId === roleId);
    if (roleRecord) {
      activePermissions.push(...roleRecord.permissions);
    } else {
      // A role is referenced in a membership but missing from the identity snapshot graph.
      // This violates the strict completeness required for historical resolution.
      frame.resolutionStatus = "INSUFFICIENT_HISTORY";
    }
  });

  // Deduplicate permissions
  const uniquePerms = new Set(activePermissions.map(p => `${p.action}::${p.resource}`));
  frame.activePermissions = Array.from(uniquePerms).map(str => {
    const [action, resource] = str.split('::');
    return { action, resource };
  });

  // 5. Resolve Active Trust Evidence
  // Evidence must cover the timestamp.
  frame.activeTrustEvidence = trustEvidence.filter(e => {
    const issuedTime = new Date(e.issuedAt).getTime();
    if (issuedTime > eventTime) return false;

    if (e.expiresAt) {
      const expiresTime = new Date(e.expiresAt).getTime();
      if (expiresTime < eventTime) return false;
    }

    return true;
  });

  return frame;
}
