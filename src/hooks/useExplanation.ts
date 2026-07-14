import { useEffect, useState } from "react";
import { ExplanationService, GraphExplanation } from "../services/explanationService";

export const useExplanation = (nodeId: string) => {
  const [explanation, setExplanation] = useState<GraphExplanation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExp = async () => {
      setLoading(true);
      try {
        const res = await ExplanationService.explainNode(nodeId);
        setExplanation(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (nodeId) fetchExp();
  }, [nodeId]);

  return { explanation, loading };
};
