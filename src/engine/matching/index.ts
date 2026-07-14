import { MarketplaceEntity, OpportunityEntity, PersonEntity, BaseEntity } from '@/types/marketplace';
import { TrustEdge } from '@/types/trustGraph';
import { calculateReflection } from '../trustPropagation/reflection';

interface MatchContext {
  searcherId: string;
  edges: TrustEdge[];
  getCounterpartyTrust: (id: string) => any;
  currentTimestamp: number; // Canonical tick timestamp for deterministic cache TTL
  relevanceScorer?: (entity: MarketplaceEntity) => number;
  demandProximityMultiplier?: (entity: MarketplaceEntity) => number; // 0 to 1 based on location
}

export function rankMatches(
  candidates: (OpportunityEntity | PersonEntity)[], 
  context: MatchContext
): (OpportunityEntity | PersonEntity)[] {
  
  const ranked = candidates.map(candidate => {
    // 1. Base Direct Trust (0-100)
    const directTrust = candidate.trustField.value;

    // 2. Direct Edge Influence (Does the searcher have a relationship with this candidate?)
    // Note: Directional edge FROM searcher TO candidate
    const directEdge = context.edges.find(e => 
      e.fromEntityId === context.searcherId && 
      e.toEntityId === candidate.identity.id
    );
    const edgeInfluence = directEdge ? (directEdge.weight * 20) : 0; 
    // Multiplied by 20 to give it meaningful ranking weight (up to 20 pts)

    // 3. Lazy Reflection Score (Second-order reputation)
    // Who trusts this candidate?
    const reflectionBonus = calculateReflection(
      candidate.identity.id, 
      context.edges, 
      context.getCounterpartyTrust,
      context.currentTimestamp
    );

    // 4. Contextual Relevance
    const relevance = context.relevanceScorer ? context.relevanceScorer(candidate) : 0;

    // 5. Demand Intensity Weight (Predictive Layer)
    // If this is an emergent opportunity, give it a massive ranking boost
    // based on how close the searcher is to the demand collapse zone.
    let demandIntensityWeight = 0;
    if (candidate.identity.variant === 'opportunity') {
      const opp = candidate as OpportunityEntity;
      if (opp.variantData.emergenceType === 'collapse') {
        const proximity = context.demandProximityMultiplier ? context.demandProximityMultiplier(opp) : 1.0;
        demandIntensityWeight = 30 * proximity; // Strong gravitational pull toward emergent needs
      }
    }

    // Final Score
    const finalScore = directTrust + edgeInfluence + reflectionBonus + relevance + demandIntensityWeight;

    return {
      entity: candidate,
      score: finalScore
    };
  });

  // Sort descending by score
  ranked.sort((a, b) => b.score - a.score);

  return ranked.map(r => r.entity);
}
