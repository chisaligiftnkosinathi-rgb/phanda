import { useEffect, useState, useCallback } from "react";
import { ConstitutionService } from "../services/constitutionService";
import { UIConstitutionViolation } from "../types/constitution.types";

export const useConstitutionViolations = () => {
  const [violations, setViolations] = useState<UIConstitutionViolation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ConstitutionService.detectConstitutionViolation();
      setViolations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  return { violations, loading, refresh: fetchViolations };
};
