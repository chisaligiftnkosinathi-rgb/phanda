import { engine, usePhandaStore } from "../ui/store/usePhandaStore";
import { SensorResult } from "../sensors/SensorResult";
import * as fs from 'fs';
import * as path from 'path';

// Helper to wait for Zustand async state changes in tests
const waitForTimelineUpdate = (store: any, expectedLength: number): Promise<void> => {
  return new Promise((resolve) => {
    const unsubscribe = store.subscribe((state: any) => {
      if (state.timeline.length >= expectedLength && !state.isLoading) {
        unsubscribe();
        resolve();
      }
    });
  });
};

describe("Constitutional Test: UI as State Projection", () => {
  
  const tempFile = path.join(__dirname, 'temp_ui_test.jpg');

  beforeAll(async () => {
    fs.writeFileSync(tempFile, "fake-bytes");
    // Ensure store is ready
    await usePhandaStore.getState().initialize();
  });

  afterAll(() => {
    try { fs.unlinkSync(tempFile); } catch {}
  });

  it("must automatically update the UI projection when the engine captures an observation", async () => {
    const store = usePhandaStore;
    const initialTimelineLength = store.getState().timeline.length;

    // 1. A simulated sensor result from the Camera
    const mockCameraResult: SensorResult = {
      type: "photo",
      tempUri: tempFile,
      timestamp: new Date().toISOString(),
      mimeType: "image/jpeg"
    };

    // We set up a promise to resolve when Zustand reactively updates
    const updatePromise = waitForTimelineUpdate(store, initialTimelineLength + 1);

    // 2. The Screen asks the Engine to capture reality. 
    // Notice the UI does NOT mutate the Zustand store directly!
    const capturedId = await engine.captureFromSensor(mockCameraResult, "Testing reactive UI projection");

    // 3. We await the reactive update triggered by the Engine's `TimelineUpdated` event
    await updatePromise;

    // 4. Verify the projection contains the actual observation
    const currentTimeline = store.getState().timeline;
    expect(currentTimeline.length).toBe(initialTimelineLength + 1);
    
    // 5. Verify it loaded as a ReplayRecord with Confidence
    const projectedObs = currentTimeline[0];
    expect(projectedObs.observationId).toBe(capturedId);
    expect(projectedObs.confidence.overall).toBe("VERIFIED"); // Deep engine logic surfaces correctly to UI!
  });
});
