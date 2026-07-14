import { useState, useMemo } from 'react';
import { useEconomicKernel } from '@/engine/runtime/useEconomicKernel';
import { projectEngineViewToMarketplaceFeed } from '@/engine/runtime/marketplaceProjection';
import { createProductionEconomyRepository } from '@/repositories/economyRegistry';
import { MarketplaceEntity } from '@/types/marketplace';
import { StatsSaPlace } from '@/components/location/StatsSaLocationPicker';

export type MarketplaceIntent = 'find-work' | 'find-people' | 'explore';

// ---------------------------------------------------------------------------
// useMarketplace (Engine-Backed)
// Replaces the mock-backed version in src/state/public/useMarketplace.ts
//
// This hook is the single point of contact between the UI and the kernel.
// No API calls. No repositories. No mocks. Pure engine output projection.
// ---------------------------------------------------------------------------

// Production repository — instantiated once, stable across re-renders
const productionRepo = createProductionEconomyRepository();

export function useEngineMarketplace(intent: MarketplaceIntent) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState<StatsSaPlace | null>(null);

  const { view, start, stop } = useEconomicKernel({
    repository: productionRepo,
    autoStart: true,
  });

  // Project engine output to the MarketplaceEntity[] shape the UI already understands
  const items: MarketplaceEntity[] = useMemo(() => {
    if (view.isLoading || view.error) return [];
    return projectEngineViewToMarketplaceFeed(
      view,
      intent,
      selectedCategory || undefined,
      location?.id || undefined
    );
  }, [view, intent, selectedCategory, location]);

  return {
    // Data (engine-derived, never mocks)
    intent,
    items,
    loading: view.isLoading,
    error: view.error,

    // Engine metadata visible to UI
    policyLevel: view.policyLevel,
    lastTickTimestamp: view.lastTickTimestamp,
    forecastTicks: view.forecast.ticks,

    // Filter state
    selectedCategory,
    location,

    // Actions
    setCategoryFilter: setSelectedCategory,
    setLocationFilter: setLocation,
    refresh: start,
  };
}
