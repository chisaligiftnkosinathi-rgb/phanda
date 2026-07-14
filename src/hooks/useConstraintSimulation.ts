import { useEffect, useState, useCallback } from "react";
import { ConstraintEvolutionService } from "../services/constraintEvolutionService";
import { UIConstraintImpactSimulation } from "../types/constraintEvolution.types";

export const useConstraintSimulation = (proposalId: string | null) => {
  const [simulation, setSimulation] = useState<UIConstraintImpactSimulation | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = useCallback(async () => {
    if (!proposalId) return;
    setLoading(true);
    try {
      const data = await ConstraintEvolutionService.simulateProposalImpact(proposalId);
      setSimulation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  return { simulation, loading, runSimulation };
};
