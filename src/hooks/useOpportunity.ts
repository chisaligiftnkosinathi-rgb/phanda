import { useState, useEffect, useCallback } from 'react';
import { OpportunityService, UIOpportunity } from '../services/opportunityService';

export function useOpportunity(id: string) {
  const [data, setData] = useState<UIOpportunity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunity = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const item = await OpportunityService.getOpportunityById(id);
      setData(item);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading opportunity details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOpportunity();
  }, [fetchOpportunity]);

  return {
    data,
    loading,
    error,
    refresh: fetchOpportunity,
  };
}
