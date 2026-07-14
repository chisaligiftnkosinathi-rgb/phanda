import { mockOpportunities, mockPeople } from "./publicEconomy";
import { MarketplaceEntity } from "@/types/marketplace";

export function getPublicFeed(): MarketplaceEntity[] {
  // simple interleaving for realism
  return [...mockOpportunities, ...mockPeople].sort(() => Math.random() - 0.5);
}
