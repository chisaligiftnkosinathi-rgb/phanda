import { SyncQueue } from "../sync/SyncQueue";
import AsyncStorage from '@react-native-async-storage/async-storage';

describe("Constitutional Test: Queue Recovery", () => {
  it("must preserve the exact state of the SyncQueue across reboots without modifying the ledger", async () => {
    // 1. Simulate an app generating 20 queue entries
    const queue1 = new SyncQueue();
    for (let i = 0; i < 20; i++) {
      await queue1.enqueue(`obs-${i}`);
    }

    // Simulate an attempt that puts #0 into NEEDS_ATTENTION
    await queue1.updateRecord("obs-0", { status: "NEEDS_ATTENTION", retryCount: 1 });

    // 2. Simulate App Crash / Restart
    // In a real app we'd reset the JS context. Here we instantiate a new Queue 
    // which reads from the same AsyncStorage mock.
    const queue2 = new SyncQueue();
    const recovered = await queue2.getQueue();

    // 3. Verify exactly 20 items survived
    expect(recovered.length).toBe(20);
    expect(recovered.find(r => r.observationId === "obs-0")?.status).toBe("NEEDS_ATTENTION");
    expect(recovered.find(r => r.observationId === "obs-19")?.status).toBe("QUEUED");
  });
});
