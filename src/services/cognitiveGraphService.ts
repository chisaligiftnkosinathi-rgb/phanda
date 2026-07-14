import { cognitiveGraphApi } from "../api/cognitiveGraphApi";
import { CGNode, CGEdge, CGLinage } from "../types/cognitiveGraph.types";

export class CognitiveGraphService {
  /**
   * Retrieves the raw nodes currently ingested by the graph compiler.
   */
  static async getNodes(): Promise<CGNode[]> {
    const res = await cognitiveGraphApi.getNodes();
    return res.data.map(this.mapNodeToUI);
  }

  /**
   * Retrieves the causal edges established deterministically by the system.
   */
  static async getEdges(): Promise<CGEdge[]> {
    const res = await cognitiveGraphApi.getEdges();
    return res.data.map(this.mapEdgeToUI);
  }

  /**
   * Explores the causal ancestry or lineage for a given node.
   */
  static async getLineage(nodeId: string): Promise<CGLinage> {
    const res = await cognitiveGraphApi.getLineage(nodeId);
    return {
      rootId: res.data.rootId || nodeId,
      path: res.data.path || [],
      depth: res.data.depth || 0,
      confidence: res.data.confidence || 1.0,
    };
  }

  /**
   * MOCK STUBS: Functions that deterministically build the graph behind the scenes.
   * They connect without mutating.
   */
  static compileGraphFromState(): void {
    // 1. Ingests all A, B, C state.
    // 2. Extracts shared keys (e.g. workId).
    // 3. Connects edges (e.g., WorkNode -> generated -> ReflectionNode).
  }

  private static mapNodeToUI(dto: any): CGNode {
    return {
      id: dto.id || "unknown",
      type: dto.type || "WorkNode",
      label: dto.label || "Untitled Node",
      timestamp: dto.timestamp || new Date().toISOString(),
    };
  }

  private static mapEdgeToUI(dto: any): CGEdge {
    return {
      from: dto.from || "",
      to: dto.to || "",
      type: dto.type || "generated",
      strength: typeof dto.strength === 'number' ? dto.strength : 1.0,
      timestamp: dto.timestamp || new Date().toISOString(),
    };
  }
}
