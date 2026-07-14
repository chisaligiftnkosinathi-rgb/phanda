import { db, EntityStatus } from '../src/db';
import { v4 as uuidv4 } from 'uuid';

function seedOrganization() {
  console.log("==========================================");
  console.log("   iPhande Organization Seed (Phase 2.2)  ");
  console.log("==========================================\n");

  const email = 'gift@globalitbs.com';

  console.log("1. Finding Founder Person record...");
  const authUserRecord: any = db.prepare('SELECT id FROM AuthUser WHERE email = ?').get(email);
  if (!authUserRecord) throw new Error("Founder AuthUser not found");
  
  const personRecord: any = db.prepare('SELECT id, preferredName FROM Person WHERE authUserId = ?').get(authUserRecord.id);
  if (!personRecord) throw new Error("Founder Person not found");
  
  console.log(`   Found Founder: ${personRecord.preferredName} (ID: ${personRecord.id})`);

  console.log("\n2. Creating Organization: Global IT and Business Solutions");
  let org: any = db.prepare("SELECT id FROM Organization WHERE slug = 'global-itbs'").get();
  
  const orgId = org?.id || uuidv4();
  
  if (!org) {
    db.prepare('INSERT INTO Organization (id, name, slug, createdByPersonId, status) VALUES (?, ?, ?, ?, ?)').run(
      orgId,
      'Global IT and Business Solutions',
      'global-itbs',
      personRecord.id,
      EntityStatus.ACTIVE
    );
    console.log(`   Organization created with ID: ${orgId}`);
  } else {
    console.log(`   Organization already exists (ID: ${orgId})`);
  }

  console.log("\n3. Establishing Roles and Permissions");
  let founderRole: any = db.prepare("SELECT id FROM Role WHERE name = 'Founder'").get();
  const roleId = founderRole?.id || uuidv4();
  
  if (!founderRole) {
    db.prepare('INSERT INTO Role (id, name, description) VALUES (?, ?, ?)').run(
      roleId,
      'Founder',
      'Creator and owner of the organization'
    );
    
    // Create base permissions
    const permId1 = uuidv4();
    const permId2 = uuidv4();
    
    db.prepare('INSERT INTO Permission (id, action, resource) VALUES (?, ?, ?)').run(permId1, 'manage', 'organization');
    db.prepare('INSERT INTO Permission (id, action, resource) VALUES (?, ?, ?)').run(permId2, 'manage', 'billing');
    
    // Link permissions to role
    db.prepare('INSERT INTO RolePermission (roleId, permissionId) VALUES (?, ?)').run(roleId, permId1);
    db.prepare('INSERT INTO RolePermission (roleId, permissionId) VALUES (?, ?)').run(roleId, permId2);
    
    console.log(`   Created Role 'Founder' and bound permissions.`);
  } else {
    console.log(`   Role 'Founder' already exists.`);
  }

  console.log("\n4. Granting Membership");
  let membership: any = db.prepare("SELECT id FROM Membership WHERE personId = ? AND organizationId = ?").get(personRecord.id, orgId);
  const membershipId = membership?.id || uuidv4();

  if (!membership) {
    db.prepare('INSERT INTO Membership (id, personId, organizationId, roleId, status) VALUES (?, ?, ?, ?, ?)').run(
      membershipId,
      personRecord.id,
      orgId,
      roleId,
      EntityStatus.ACTIVE
    );
    console.log(`   Membership granted! Gift is now Founder of Global IT and Business Solutions.`);
  } else {
    console.log(`   Membership already exists.`);
  }

  console.log("\n5. Verifying Authorization Path (Person -> Role -> Permissions)");
  
  const query = `
    SELECT p.action, p.resource
    FROM Membership m
    JOIN RolePermission rp ON m.roleId = rp.roleId
    JOIN Permission p ON rp.permissionId = p.id
    WHERE m.personId = ? AND m.organizationId = ?
  `;
  const permissions = db.prepare(query).all(personRecord.id, orgId) as any[];
  
  console.log(`   Permissions for Gift in Global IT and Business Solutions:`);
  permissions.forEach(p => console.log(`   - ${p.action}:${p.resource}`));

  console.log("\n==========================================");
  console.log("   Organization & Authorization Seed PASSED");
  console.log("==========================================\n");
}

try {
  seedOrganization();
} catch (e) {
  console.error("Seed failed:", e);
  process.exit(1);
}
