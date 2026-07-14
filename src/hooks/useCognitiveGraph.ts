import { useEffect, useState, useCallback } from "react";
import { CognitiveGraphService } from "../services/cognitiveGraphService";
import { CGNode, CGEdge } from "../types/cognitiveGraph.types";

export const useCognitiveGraph = () => {
  const [nodes, setNodes] = useState<CGNode[]>([]);
  const [edges, setEdges] = useState<CGEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    try {
      const [n, e] = await Promise.all([
        CognitiveGraphService.getNodes(),
        CognitiveGraphService.getEdges()
      ]);
      setNodes(n);
      setEdges(e);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  return { nodes, edges, loading, error, refresh: fetchGraph };
};
