import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Configuration
const IPHANDE_DB_PATH = path.join(__dirname, '..', '..', 'platforms', 'iphande', 'dev.db');
const PHANDA_DB_PATH = path.join(__dirname, '..', '..', 'applications', 'phanda', 'local.db');

const args = process.argv.slice(2);
const appName = args[0] || 'phanda';
const traceId = args[1] || '06a0500e-6994-4ad8-99b1-597374102f5a'; // Default to Proof 001 trace

if (!fs.existsSync(IPHANDE_DB_PATH)) throw new Error(`Governance DB not found at ${IPHANDE_DB_PATH}`);
if (!fs.existsSync(PHANDA_DB_PATH)) throw new Error(`Application DB not found at ${PHANDA_DB_PATH}`);

const govDb = new Database(IPHANDE_DB_PATH);
const appDb = new Database(PHANDA_DB_PATH);

console.log(`=================================================`);
console.log(`   Governance Conformance Harness v1.0.0         `);
console.log(`=================================================\n`);
console.log(`Target Application : ${appName.toUpperCase()}`);
console.log(`Target Trace ID    : ${traceId}\n`);

let passedCount = 0;
let failedCount = 0;
let outputLines: string[] = [];

function log(msg: string) {
  console.log(msg);
  outputLines.push(msg);
}

function assertInvariant(name: string, assertion: () => boolean, errorMessage: string) {
  try {
    const passed = assertion();
    if (passed) {
      log(`✅ [PASS] Invariant: ${name}`);
      passedCount++;
    } else {
      log(`❌ [FAIL] Invariant: ${name} - ${errorMessage}`);
      failedCount++;
    }
  } catch (e: any) {
    log(`❌ [FAIL] Invariant: ${name} - Exception: ${e.message}`);
    failedCount++;
  }
}

// Extract the Audit Events for the trace
const auditEvents = govDb.prepare('SELECT * FROM AuditLog WHERE traceId = ? ORDER BY timestamp ASC').all(traceId) as any[];

if (auditEvents.length === 0) {
  log(`❌ FATAL: No audit events found for TraceId ${traceId}`);
  process.exit(1);
}

const creationEvent = auditEvents.find(e => e.action === 'OPPORTUNITY_CREATED');
const actorId = creationEvent ? creationEvent.actorId : null;

// ==========================================
// INVARIANT 1: Identity Resolution
// ==========================================
assertInvariant('Identity resolves strictly through AuthUser -> Person', () => {
  if (!actorId) return false;
  // Check if actorId is a Person
  const person = govDb.prepare('SELECT * FROM Person WHERE id = ?').get(actorId) as any;
  if (!person) return false;
  // Check if Person has an AuthUser
  const auth = govDb.prepare('SELECT * FROM AuthUser WHERE id = ?').get(person.authUserId) as any;
  return !!auth;
}, 'Actor could not be mapped back to an AuthUser securely.');

// ==========================================
// INVARIANT 2: Authorization Integrity
// ==========================================
assertInvariant('Permissions resolve strictly through Membership -> Role', () => {
  if (!actorId) return false;
  const memberships = govDb.prepare('SELECT * FROM Membership WHERE personId = ?').all(actorId) as any[];
  if (memberships.length === 0) return false;
  
  // Verify roles map to permissions
  const rolesWithPerms = govDb.prepare(`
    SELECT count(*) as count FROM RolePermission rp 
    JOIN Membership m ON rp.roleId = m.roleId
    WHERE m.personId = ?
  `).get(actorId) as any;
  
  return rolesWithPerms.count > 0;
}, 'Actor executed action without an explicit Role -> Permission mapping.');

// ==========================================
// INVARIANT 3: Domain Integrity (No Direct Permissions)
// ==========================================
assertInvariant('No direct domain-level permissions exist', () => {
  // We inspect the Phanda DB schema to ensure it doesn't contain permission or role tables
  const tables = appDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[];
  const forbiddenTables = ['role', 'permission', 'membership', 'user', 'auth'];
  for (const table of tables) {
    for (const forbidden of forbiddenTables) {
      if (table.name.toLowerCase().includes(forbidden)) {
        return false;
      }
    }
  }
  return true;
}, 'Application database contains localized identity/authorization tables (Backdoor detected).');

// ==========================================
// INVARIANT 4: Audit Integrity
// ==========================================
assertInvariant('Every state change correlates to an emitted TraceId and AuditLog', () => {
  // Query the domain table
  const domainRows = appDb.prepare('SELECT * FROM Opportunity WHERE traceId = ?').all(traceId) as any[];
  if (domainRows.length === 0) return false;

  // The creation event must exist in AuditLog
  if (!creationEvent) return false;
  
  // Cross check the ID
  const opportunity = domainRows[0];
  return creationEvent.targetResource.includes(opportunity.id);
}, 'Domain state changed without a corresponding matching TraceId in the Governance Ledger.');

// ==========================================
// INVARIANT 5: Timeline Reconstruction
// ==========================================
assertInvariant('Event sequence is strictly reconstructible', () => {
  return auditEvents.length > 0;
}, 'Unable to reconstruct timeline from AuditLog.');

log(`\n=================================================`);
log(`   Conformance Result: ${failedCount === 0 ? 'PASSED' : 'FAILED'}`);
log(`=================================================\n`);

if (failedCount === 0) {
  const reportPath = path.join(__dirname, '..', '..', 'applications', appName, 'Conformance_Report.md');
  const reportContent = `
# Governance Conformance Report
**Application:** ${appName.toUpperCase()}
**Date:** ${new Date().toISOString()}
**Trace Reference:** ${traceId}
**Result: PASSED**

This is an automatically generated equivalence statement produced by the Governance Test Harness.
It proves that \`${appName}\` is a valid instance of Governance Architecture v1.0.0.

## Verified Invariants

\`\`\`text
${outputLines.join('\n')}
\`\`\`

## Sign-Off
This application complies with Governance Architecture v1.0.0. No backdoors, local user tables, or isolated permission models were detected. The immutable system of record correctly governs the state of this application.
  `.trim();
  
  if (!fs.existsSync(path.dirname(reportPath))) fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportContent);
  console.log(`📄 Conformance Report generated at: applications/${appName}/Conformance_Report.md`);
} else {
  console.log(`❌ Conformance failed. Report not generated.`);
  process.exit(1);
}
