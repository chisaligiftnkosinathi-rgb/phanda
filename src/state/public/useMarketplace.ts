import { useState } from 'react';
import { getPublicFeed } from '@/mocks/publicFeed';
import { getArchetypeGroups } from '@/types/tradeArchetypeTree';
import { StatsSaPlace } from '@/components/location/StatsSaLocationPicker';

export type MarketplaceIntent = "find-work" | "find-people" | "explore";

export function useMarketplace(intent: MarketplaceIntent) {
    const [selectedArchetype, setSelectedArchetype] = useState('');
    const [location, setLocation] = useState<StatsSaPlace | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Mock derived data
    const allFeed = getPublicFeed();
    const filterArchetypes = getArchetypeGroups() || [];

    // Derive the feed based on current intent
    const feed = allFeed.filter(item => {
        if (intent === "find-work" && item.identity.variant !== "opportunity") return false;
        if (intent === "find-people" && item.identity.variant !== "person") return false;

        // "explore" returns everything, like a general marketplace feed

        // Mock filtering (naive simulation)
        if (selectedArchetype && item.identity.variant === "opportunity") {
            // Real backend would filter by archetype, here we just return all mock data for now
        }
        return true;
    });

    return {
        // Derived Data
        intent,
        items: feed,
        loading: false,
        
        // Filter Data
        filterArchetypes,
        selectedArchetype,
        location,
        showFilters,

        // Actions (Explicit Contracts)
        setArchetypeFilter: (arch: string) => setSelectedArchetype(arch),
        setLocationFilter: (loc: StatsSaPlace | null) => setLocation(loc),
        toggleFilters: () => setShowFilters(prev => !prev),
        refresh: () => console.log(`Mock refresh triggered for intent: ${intent}`),
    };
}
