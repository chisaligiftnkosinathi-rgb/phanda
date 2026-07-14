import { db } from '../src/db';
import { v4 as uuidv4 } from 'uuid';

function runValidationGate() {
  console.log("==========================================");
  console.log("   Identity Validation Gate (Phase 2.2)   ");
  console.log("==========================================\n");

  let checksPassed = 0;
  const totalChecks = 10;
  const email = 'gift@globalitbs.com';

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      checksPassed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      throw new Error(`Validation Gate Failed: ${msg}`);
    }
  }

  const authUserRecord: any = db.prepare('SELECT id FROM AuthUser WHERE email = ?').get(email);
  assert(!!authUserRecord, "AuthUser created");

  const personRecord: any = db.prepare('SELECT id, authUserId FROM Person WHERE authUserId = ?').get(authUserRecord.id);
  assert(!!personRecord, "Person linked to AuthUser");

  assert(personRecord.authUserId === authUserRecord.id, "AuthUser resolves Person");
  
  const reverseLookup: any = db.prepare('SELECT id FROM AuthUser WHERE id = ?').get(personRecord.authUserId);
  assert(reverseLookup.id === authUserRecord.id, "Person resolves AuthUser");

  const org: any = db.prepare("SELECT id FROM Organization WHERE slug = 'global-itbs'").get();
  assert(!!org, "Organization created");

  const membership: any = db.prepare("SELECT id, roleId FROM Membership WHERE personId = ? AND organizationId = ?").get(personRecord.id, org.id);
  assert(!!membership, "Membership created");

  const role: any = db.prepare("SELECT name FROM Role WHERE id = ?").get(membership.roleId);
  assert(role.name === 'Founder', "Founder role assigned");

  const permissions = db.prepare(`
    SELECT p.action, p.resource
    FROM Membership m
    JOIN RolePermission rp ON m.roleId = rp.roleId
    JOIN Permission p ON rp.permissionId = p.id
    WHERE m.personId = ? AND m.organizationId = ?
  `).all(personRecord.id, org.id) as any[];
  assert(permissions.length > 0 && permissions.some(p => p.action === 'manage' && p.resource === 'organization'), "Permissions resolved through Role");

  const personCols = db.prepare('PRAGMA table_info(Person)').all() as any[];
  const hasDirectPermissions = personCols.some(c => c.name.toLowerCase().includes('permission') || c.name.toLowerCase().includes('role'));
  assert(!hasDirectPermissions, "Direct person permissions prevented");

  try {
    db.prepare('INSERT INTO Person (id, authUserId, preferredName) VALUES (?, ?, ?)').run(uuidv4(), 'invalid-auth-id', 'Test');
    assert(false, "Foreign key constraints enforced (Person -> AuthUser)");
  } catch (e: any) {
    assert(e.message.includes('FOREIGN KEY constraint failed'), "Foreign key constraints enforced");
  }

  try {
    db.prepare('INSERT INTO Membership (id, personId, organizationId, roleId) VALUES (?, ?, ?, ?)').run(
      uuidv4(), personRecord.id, org.id, 'invalid-role-id'
    );
    assert(false, "Unauthorized role assignment rejected");
  } catch (e: any) {
    assert(e.message.includes('FOREIGN KEY constraint failed'), "Unauthorized role assignment rejected (invalid roleId)");
  }

  console.log("\n==========================================");
  if (checksPassed === totalChecks + 1) { // 10 original checks + 1 governance check
    console.log(`   Validation Gate PASSED (${checksPassed}/${totalChecks + 1})`);
  }
  console.log("==========================================\n");
}

try {
  runValidationGate();
} catch (e) {
  console.error(e);
  process.exit(1);
}
