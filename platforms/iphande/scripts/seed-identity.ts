import { db, EntityStatus } from '../src/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedIdentity() {
  console.log("==========================================");
  console.log("   iPhande Identity Migration (Phase 2.2) ");
  console.log("==========================================\n");

  const email = 'gift@globalitbs.com';
  const name = 'Gift Nkosinathi Chisali';
  const password = 'SecurePassword123';

  console.log("1. Checking if Founder exists...");
  let user: any = db.prepare('SELECT * FROM AuthUser WHERE email = ?').get(email);
  let authUserId: string = user?.id;
  let personId: string;

  if (!user) {
    console.log("   Founder not found. Creating...");
    const hashedPassword = await bcrypt.hash(password, 10);
    authUserId = uuidv4();
    personId = uuidv4();

    const insertAuthUser = db.prepare('INSERT INTO AuthUser (id, email, passwordHash, credentialStatus) VALUES (?, ?, ?, ?)');
    const insertPerson = db.prepare('INSERT INTO Person (id, authUserId, preferredName, status) VALUES (?, ?, ?, ?)');
    
    db.transaction(() => {
      insertAuthUser.run(authUserId, email, hashedPassword, EntityStatus.ACTIVE);
      insertPerson.run(personId, authUserId, name, EntityStatus.ACTIVE);
    })();
    console.log(`   Created AuthUser: ${authUserId}`);
    console.log(`   Created Person:   ${personId}`);
  } else {
    console.log("   Founder already exists.");
    const person: any = db.prepare('SELECT id FROM Person WHERE authUserId = ?').get(authUserId);
    personId = person?.id;
  }

  console.log("\n2. Verifying Bidirectional Query (AuthUser -> Person)");
  const authUserRecord: any = db.prepare('SELECT * FROM AuthUser WHERE email = ?').get(email);
  const personFromAuth: any = db.prepare('SELECT * FROM Person WHERE authUserId = ?').get(authUserRecord.id);
  console.log(`   Found Person: ${personFromAuth.preferredName} (ID: ${personFromAuth.id}) from AuthUser`);

  console.log("\n3. Verifying Bidirectional Query (Person -> AuthUser)");
  const personRecord: any = db.prepare('SELECT * FROM Person WHERE id = ?').get(personId);
  const authFromPerson: any = db.prepare('SELECT * FROM AuthUser WHERE id = ?').get(personRecord.authUserId);
  console.log(`   Found AuthUser: ${authFromPerson.email} from Person`);

  if (personFromAuth.id !== personId || authFromPerson.id !== authUserId) {
    throw new Error("Bidirectional verification failed");
  }

  console.log("\n==========================================");
  console.log("   Identity Migration & Verification PASSED");
  console.log("==========================================\n");
}

seedIdentity().catch(console.error);
