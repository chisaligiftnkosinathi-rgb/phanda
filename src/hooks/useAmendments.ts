import { useEffect, useState, useCallback } from "react";
import { ConstitutionService } from "../services/constitutionService";
import { UIConstitutionAmendment } from "../types/constitution.types";

export const useAmendments = () => {
  const [amendments, setAmendments] = useState<UIConstitutionAmendment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAmendments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ConstitutionService.getAmendments();
      setAmendments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmendments();
  }, [fetchAmendments]);

  return { amendments, loading, refresh: fetchAmendments };
};
