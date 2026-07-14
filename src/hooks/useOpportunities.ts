import { useState, useEffect, useCallback } from 'react';
import { OpportunityService, UIOpportunity } from '../services/opportunityService';
import { OpportunityFilters } from '../api/opportunityApi';

export function useOpportunities(filters?: OpportunityFilters) {
  const [data, setData] = useState<UIOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await OpportunityService.getOpportunities(filters);
      setData(items);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading opportunities.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return {
    data,
    loading,
    error,
    refresh: fetchOpportunities,
  };
}
