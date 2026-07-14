import { AsyncStorageAdapter } from "../AsyncStorageAdapter";
import { Observation } from "../../types/Observation";
import { StorageErrorCodes } from "../../types/StorageResult";

describe("Constitutional Test: Immutability", () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    adapter = new AsyncStorageAdapter();
  });

  it("must reject an attempt to mutate an existing observation", async () => {
    const obs: Observation = { 
      id: "1", 
      occurredAt: "2026-07-02T10:00:00Z", 
      capturedAt: "2026-07-02T10:00:00Z", 
      type: "text", 
      content: "Original",
      schemaVersion: 1,
      previousHash: "00000000000000000000000000000000",
      hash: "mock-immutability-hash"
    };
    await adapter.saveObservation(obs);

    const mutatedObs: Observation = { ...obs, content: "Mutated" };
    const result = await adapter.saveObservation(mutatedObs);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe(StorageErrorCodes.IMMUTABILITY_VIOLATION);
    }
  });
});