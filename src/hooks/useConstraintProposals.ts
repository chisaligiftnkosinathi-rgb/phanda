import { useEffect, useState, useCallback } from "react";
import { ConstraintEvolutionService } from "../services/constraintEvolutionService";
import { UIConstraintProposal } from "../types/constraintEvolution.types";

export const useConstraintProposals = () => {
  const [proposals, setProposals] = useState<UIConstraintProposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ConstraintEvolutionService.generateConstraintProposals();
      setProposals(ConstraintEvolutionService.rankConstraintProposals(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return { proposals, loading, refresh: fetchProposals };
};
