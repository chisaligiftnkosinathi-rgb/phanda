import { SupplySignal, SupplyField } from '@/types/supply';

export const mockSupplySignals: SupplySignal[] = [
  {
    id: "supply-1",
    personId: "person-1", // Sipho
    capability: "Plumbing",
    location: { label: "Pretoria East" },
    capacity: 0.9,
    availability: 0.8,
    responsiveness: 0.9,
    fatigue: 0.1,
    drift: 0.0,
    trustStability: 0.9,
    lastUpdated: new Date().toISOString(),
    lastActionCompletedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "supply-2",
    personId: "person-2", // Aisha
    capability: "UI/UX Design",
    location: { label: "Remote" },
    capacity: 0.3, // Overworked
    availability: 0.2,
    responsiveness: 0.5,
    fatigue: 0.8, // High fatigue
    drift: 0.1,
    trustStability: 0.7,
    lastUpdated: new Date().toISOString(),
  }
];

export const mockSupplyField: SupplyField = {
  signals: mockSupplySignals,
  pressure: 0.85,
  elasticity: 0.6,
  volatility: 0.2,
};
