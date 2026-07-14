import { db } from '../src/db';

function printEventJourney(actorId: string) {
  console.log("==========================================");
  console.log("   Event Journey (Phase 2.3)              ");
  console.log("==========================================\n");

  const query = `
    SELECT timestamp, action, targetResource, traceId, correlationId
    FROM AuditLog
    WHERE actorId = ?
    ORDER BY timestamp ASC
  `;

  const events = db.prepare(query).all(actorId) as any[];

  if (events.length === 0) {
    console.log(`No events found for actor: ${actorId}`);
    return;
  }

  console.log(`Journey for Actor: ${actorId}\n`);
  
  events.forEach((e, i) => {
    console.log(`${String(i + 1).padStart(2, ' ')}. [${e.timestamp}] ${e.action}`);
    console.log(`    ↳ Target: ${e.targetResource}`);
    console.log(`    ↳ Trace:  ${e.traceId}`);
    if (e.correlationId) {
      console.log(`    ↳ Correlation: ${e.correlationId}`);
    }
    if (i < events.length - 1) console.log(`    ↓`);
  });

  console.log("\n==========================================");
}

// Example usage if run directly (we'll query the Founder AuthUser ID if it exists)
if (require.main === module) {
  const email = 'gift@globalitbs.com';
  const user: any = db.prepare('SELECT id FROM AuthUser WHERE email = ?').get(email);
  if (user) {
    printEventJourney(user.id);
  } else {
    console.log("Founder not found. Cannot print journey.");
  }
}

export { printEventJourney };
