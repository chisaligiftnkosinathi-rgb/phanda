import { useEffect, useState, useCallback } from "react";
import { ConstitutionService } from "../services/constitutionService";
import { UIConstitutionVersion } from "../types/constitution.types";

export const useConstitution = () => {
  const [constitution, setConstitution] = useState<UIConstitutionVersion | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConstitution = useCallback(() => {
    setLoading(true);
    try {
      const data = ConstitutionService.getConstitutionVersion();
      setConstitution(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConstitution();
  }, [loadConstitution]);

  return { constitution, loading, refresh: loadConstitution };
};
