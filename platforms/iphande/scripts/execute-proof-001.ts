
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const IPHANDE_URL = 'http://localhost:4000/api/v1';

// Setup Mock Phanda Local DB
const dbPath = path.join(__dirname, '..', '..', '..', 'applications', 'phanda', 'local.db');
if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath); // Reset for clean proof
const phandaDb = new Database(dbPath);

phandaDb.exec(`
  CREATE TABLE IF NOT EXISTS Opportunity (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    creatorId TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    traceId TEXT NOT NULL,
    correlationId TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

async function runProof() {
  console.log("=================================================");
  console.log("   Executing Proof of Work 001 (Phanda -> iPhande) ");
  console.log("=================================================\n");

  const traceId = uuidv4();
  const correlationId = uuidv4();
  console.log(`[Flow Context] TraceId: ${traceId} | CorrelationId: ${correlationId}\n`);

  try {
    // 1. Authentication
    console.log("1. Authenticating...");
    const loginRes = await fetch(`${IPHANDE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'gift@globalitbs.com', password: 'SecurePassword123' })
    });
    if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);
    const loginData = await loginRes.json();
    const accessToken = loginData.accessToken;
    const authUser = loginData.user;
    console.log(`   ✅ JWT Issued for AuthUser: ${authUser.id}`);

    // 2. Identity & Membership Resolution
    console.log("\n2. Resolving Identity & Memberships...");
    const identityRes = await fetch(`${IPHANDE_URL}/identity/me`, {
      headers: { 'x-auth-user-id': authUser.id }
    });
    if (!identityRes.ok) throw new Error(`Identity resolution failed: ${await identityRes.text()}`);
    const identityData = await identityRes.json();
    const { person, memberships } = identityData;
    console.log(`   ✅ Person Resolved: ${person.name} (${person.id})`);
    
    const targetOrg = memberships.find((m: any) => m.slug === 'global-itbs');
    if (!targetOrg) throw new Error("Membership not found");
    console.log(`   ✅ Membership Resolved: ${targetOrg.role} in ${targetOrg.slug}`);

    // 3. Authorization
    console.log("\n3. Authorizing Action...");
    if (!targetOrg.permissions.includes('manage:organization')) {
      throw new Error("Unauthorized to create opportunity");
    }
    console.log(`   ✅ Permission Derived: manage:organization`);

    // 4. Domain Action (Phanda Creates Opportunity)
    console.log("\n4. Executing Domain Action...");
    const opportunityId = uuidv4();
    phandaDb.prepare(`
      INSERT INTO Opportunity (id, title, creatorId, organizationId, traceId, correlationId)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(opportunityId, 'Senior Frontend Engineer', person.id, targetOrg.id, traceId, correlationId);
    console.log(`   ✅ Opportunity Persisted (ID: ${opportunityId})`);

    // 5. Verification (Audit Logging)
    console.log("\n5. Writing Audit Event to iPhande...");
    const auditRes = await fetch(`${IPHANDE_URL}/audit/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traceId,
        correlationId,
        sourceLayer: 'Domain (Phanda)',
        domain: 'phanda',
        action: 'OPPORTUNITY_CREATED',
        actorId: person.id,
        targetResource: `opportunity:${opportunityId}`
      })
    });
    if (!auditRes.ok) throw new Error(`Audit logging failed: ${await auditRes.text()}`);
    console.log(`   ✅ Audit Event Written`);

    console.log("\n=================================================");
    console.log("   Proof of Work Execution Completed Successfully! ");
    console.log("=================================================\n");

  } catch (e: any) {
    console.error("\n❌ Proof Failed:", e.message);
    process.exit(1);
  }
}

runProof();
