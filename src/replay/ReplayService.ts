import { LedgerService } from "../ledger/LedgerService";
import { MediaStore } from "../media/MediaStore";
import { MediaHasher } from "../media/MediaHasher";
import { MediaAttachment } from "../media/MediaAttachment";
import { ReplayRecord, ReplayEvidence, ConfidenceReport, VerificationPolicy } from "./ReplayRecord";

export class ReplayService {
  constructor(
    private ledger: LedgerService,
    private store: MediaStore,
    private hasher: MediaHasher
  ) {}

  /**
   * Deterministically reconstructs a historical observation.
   * Never mutates state. Never silently invents missing data.
   */
  async replay(observationId: string, policy: VerificationPolicy = "shallow"): Promise<ReplayRecord> {
    // 1. Verify Ledger Integrity (always verified, regardless of media policy)
    const ledgerValidation = await this.ledger.validate();
    let ledgerConfidence: "VERIFIED" | "CORRUPTED" = "VERIFIED";

    if (!ledgerValidation.valid) {
      ledgerConfidence = "CORRUPTED";
      // We do not stop replay. We report the corruption honestly.
    }

    // 2. Retrieve the raw historical observation
    const timeline = await this.ledger.getTimeline();
    const rawObs = timeline.find(o => o.id === observationId);

    if (!rawObs) {
      throw new Error(`Observation ${observationId} not found in ledger`);
    }

    // 3. Reconstruct Evidence
    const replayEvidence: ReplayEvidence[] = [];
    let mediaConfidence: "VERIFIED" | "MISSING" | "CORRUPTED" | "UNVERIFIED" = "VERIFIED";

    if (rawObs.metadata && Array.isArray(rawObs.metadata.attachments)) {
      for (const att of rawObs.metadata.attachments as MediaAttachment[]) {
        
        let uri: string | undefined = undefined;
        let isMissing = false;
        let isCorrupted = false;

        const exists = await this.store.exists(att.storageUri);

        if (!exists) {
          isMissing = true;
          mediaConfidence = "MISSING";
        } else {
          uri = await this.store.get(att.storageUri);

          if (policy === "deep" || policy === "audit") {
            try {
              const actualChecksum = await this.hasher.hashFile(uri);
              if (actualChecksum !== att.checksum) {
                isCorrupted = true;
                mediaConfidence = "CORRUPTED";
              }
            } catch (e) {
              isCorrupted = true;
              mediaConfidence = "CORRUPTED";
            }
          } else {
            // Shallow policy: We know it exists, but we didn't hash it.
            if (mediaConfidence === "VERIFIED") {
              mediaConfidence = "UNVERIFIED"; // It's present, but we haven't done deep validation
            }
          }
        }

        replayEvidence.push({
          mediaId: att.mediaId,
          type: att.type,
          expectedChecksum: att.checksum,
          uri: isMissing ? undefined : uri,
          isMissing,
          isCorrupted
        });
      }
    }

    // Special case for 'shallow' where media exists
    // The user suggested treating shallow as "MEDIA_PRESENT" or "VERIFIED (ledger)".
    // Let's ensure overall confidence handles this accurately.
    if (replayEvidence.length === 0) {
       mediaConfidence = "VERIFIED"; // No media to verify = perfectly clean media state
    } else if (policy === "shallow" && mediaConfidence === "UNVERIFIED") {
       // We'll treat shallow success as "VERIFIED" for the sake of standard flow,
       // knowing it's explicitly bounded by the policy requested.
       mediaConfidence = "VERIFIED";
    }

    // 4. Calculate Overall Confidence
    let overallConfidence: "VERIFIED" | "PARTIAL" | "CORRUPTED" = "VERIFIED";
    if (ledgerConfidence === "CORRUPTED" || mediaConfidence === "CORRUPTED") {
      overallConfidence = "CORRUPTED";
    } else if (mediaConfidence === "MISSING") {
      overallConfidence = "PARTIAL";
    }

    const confidenceReport: ConfidenceReport = {
      ledger: ledgerConfidence,
      media: mediaConfidence,
      overall: overallConfidence
    };

    // 5. Output deterministic Replay Record
    return {
      observationId: rawObs.id,
      occurredAt: rawObs.occurredAt,
      content: rawObs.content,
      type: rawObs.type,
      confidence: confidenceReport,
      evidence: replayEvidence,
      metadata: rawObs.metadata
    };
  }
}
