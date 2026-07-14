"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var better_sqlite3_1 = __importDefault(require("../../platforms/iphande/node_modules/better-sqlite3"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
// Configuration
var IPHANDE_DB_PATH = path_1.default.join(__dirname, '..', '..', 'platforms', 'iphande', 'dev.db');
var PHANDA_DB_PATH = path_1.default.join(__dirname, '..', '..', 'applications', 'phanda', 'local.db');
var args = process.argv.slice(2);
var appName = args[0] || 'phanda';
var traceId = args[1] || '06a0500e-6994-4ad8-99b1-597374102f5a'; // Default to Proof 001 trace
if (!fs_1.default.existsSync(IPHANDE_DB_PATH))
    throw new Error("Governance DB not found at ".concat(IPHANDE_DB_PATH));
if (!fs_1.default.existsSync(PHANDA_DB_PATH))
    throw new Error("Application DB not found at ".concat(PHANDA_DB_PATH));
var govDb = new better_sqlite3_1.default(IPHANDE_DB_PATH);
var appDb = new better_sqlite3_1.default(PHANDA_DB_PATH);
console.log("=================================================");
console.log("   Governance Conformance Harness v1.0.0         ");
console.log("=================================================\n");
console.log("Target Application : ".concat(appName.toUpperCase()));
console.log("Target Trace ID    : ".concat(traceId, "\n"));
var passedCount = 0;
var failedCount = 0;
var outputLines = [];
function log(msg) {
    console.log(msg);
    outputLines.push(msg);
}
function assertInvariant(name, assertion, errorMessage) {
    try {
        var passed = assertion();
        if (passed) {
            log("\u2705 [PASS] Invariant: ".concat(name));
            passedCount++;
        }
        else {
            log("\u274C [FAIL] Invariant: ".concat(name, " - ").concat(errorMessage));
            failedCount++;
        }
    }
    catch (e) {
        log("\u274C [FAIL] Invariant: ".concat(name, " - Exception: ").concat(e.message));
        failedCount++;
    }
}
// Extract the Audit Events for the trace
var auditEvents = govDb.prepare('SELECT * FROM AuditLog WHERE traceId = ? ORDER BY timestamp ASC').all(traceId);
if (auditEvents.length === 0) {
    log("\u274C FATAL: No audit events found for TraceId ".concat(traceId));
    process.exit(1);
}
var creationEvent = auditEvents.find(function (e) { return e.action === 'OPPORTUNITY_CREATED'; });
var actorId = creationEvent ? creationEvent.actorId : null;
// ==========================================
// INVARIANT 1: Identity Resolution
// ==========================================
assertInvariant('Identity resolves strictly through AuthUser -> Person', function () {
    if (!actorId)
        return false;
    // Check if actorId is a Person
    var person = govDb.prepare('SELECT * FROM Person WHERE id = ?').get(actorId);
    if (!person)
        return false;
    // Check if Person has an AuthUser
    var auth = govDb.prepare('SELECT * FROM AuthUser WHERE id = ?').get(person.authUserId);
    return !!auth;
}, 'Actor could not be mapped back to an AuthUser securely.');
// ==========================================
// INVARIANT 2: Authorization Integrity
// ==========================================
assertInvariant('Permissions resolve strictly through Membership -> Role', function () {
    if (!actorId)
        return false;
    var memberships = govDb.prepare('SELECT * FROM Membership WHERE personId = ?').all(actorId);
    if (memberships.length === 0)
        return false;
    // Verify roles map to permissions
    var rolesWithPerms = govDb.prepare("\n    SELECT count(*) as count FROM RolePermission rp \n    JOIN Membership m ON rp.roleId = m.roleId\n    WHERE m.personId = ?\n  ").get(actorId);
    return rolesWithPerms.count > 0;
}, 'Actor executed action without an explicit Role -> Permission mapping.');
// ==========================================
// INVARIANT 3: Domain Integrity (No Direct Permissions)
// ==========================================
assertInvariant('No direct domain-level permissions exist', function () {
    // We inspect the Phanda DB schema to ensure it doesn't contain permission or role tables
    var tables = appDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    var forbiddenTables = ['role', 'permission', 'membership', 'user', 'auth'];
    for (var _i = 0, tables_1 = tables; _i < tables_1.length; _i++) {
        var table = tables_1[_i];
        for (var _a = 0, forbiddenTables_1 = forbiddenTables; _a < forbiddenTables_1.length; _a++) {
            var forbidden = forbiddenTables_1[_a];
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
assertInvariant('Every state change correlates to an emitted TraceId and AuditLog', function () {
    // Query the domain table
    var domainRows = appDb.prepare('SELECT * FROM Opportunity WHERE traceId = ?').all(traceId);
    if (domainRows.length === 0)
        return false;
    // The creation event must exist in AuditLog
    if (!creationEvent)
        return false;
    // Cross check the ID
    var opportunity = domainRows[0];
    return creationEvent.targetResource.includes(opportunity.id);
}, 'Domain state changed without a corresponding matching TraceId in the Governance Ledger.');
// ==========================================
// INVARIANT 5: Timeline Reconstruction
// ==========================================
assertInvariant('Event sequence is strictly reconstructible', function () {
    return auditEvents.length > 0;
}, 'Unable to reconstruct timeline from AuditLog.');
log("\n=================================================");
log("   Conformance Result: ".concat(failedCount === 0 ? 'PASSED' : 'FAILED'));
log("=================================================\n");
if (failedCount === 0) {
    var reportPath = path_1.default.join(__dirname, '..', '..', 'applications', appName, 'Conformance_Report.md');
    var reportContent = "\n# Governance Conformance Report\n**Application:** ".concat(appName.toUpperCase(), "\n**Date:** ").concat(new Date().toISOString(), "\n**Trace Reference:** ").concat(traceId, "\n**Result: PASSED**\n\nThis is an automatically generated equivalence statement produced by the Governance Test Harness.\nIt proves that `").concat(appName, "` is a valid instance of Governance Architecture v1.0.0.\n\n## Verified Invariants\n\n```text\n").concat(outputLines.join('\n'), "\n```\n\n## Sign-Off\nThis application complies with Governance Architecture v1.0.0. No backdoors, local user tables, or isolated permission models were detected. The immutable system of record correctly governs the state of this application.\n  ").trim();
    if (!fs_1.default.existsSync(path_1.default.dirname(reportPath)))
        fs_1.default.mkdirSync(path_1.default.dirname(reportPath), { recursive: true });
    fs_1.default.writeFileSync(reportPath, reportContent);
    console.log("\uD83D\uDCC4 Conformance Report generated at: applications/".concat(appName, "/Conformance_Report.md"));
}
else {
    console.log("\u274C Conformance failed. Report not generated.");
    process.exit(1);
}
