import { EvidenceRepository } from "@axionyx/ports";
import { EvidenceBundle } from "@axionyx/contracts";

export class LocalEvidenceRepository implements EvidenceRepository {
  private store = new Map<string, EvidenceBundle>();

  async findById(id: string): Promise<EvidenceBundle | null> {
    return this.store.get(id) || null;
  }

  async save(evidence: EvidenceBundle): Promise<void> {
    console.log(`[Adapter] Saving evidence to Local DB: ${evidence.id}`);
    this.store.set(evidence.id, evidence);
  }
}
