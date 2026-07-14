export type EntityVariant = "opportunity" | "person" | "business";

export interface IdentityLayer {
  id: string;
  variant: EntityVariant;
  title: string;
  subtitle?: string;
}

export interface VisibilityLayer {
  location: string;
  activeStatus?: string;
  visibilityRadius?: number;
}

export interface EvidenceItem {
  id: string;
  type: "photo" | "document" | "video";
  beforeUri?: string;
  afterUri?: string;
  uri?: string; 
  timestamp: string;
  verified: boolean;
}

export interface EvidenceRecord {
  completedCount: number;
  verificationLevel: number;
  lastActivity?: string;
  items?: EvidenceItem[];
}

export type TrustAnchorClass = 
  | 'UNSTABLE' 
  | 'EMERGING' 
  | 'RELIABLE' 
  | 'PROVEN' 
  | 'ANCHOR';

export interface TrustField {
  value: number;           // 0-100 (Display layer only)
  velocity: number;        // Rate of trust change
  acceleration: number;    // Second derivative (momentum shifts)
  stability: number;       // Consistency over time (0 to 1)
  lastUpdated: string;     // ISO Timestamp
  anchorClass: TrustAnchorClass; // Derived class
}

export interface BaseEntity {
  identity: IdentityLayer;
  visibility: VisibilityLayer;
  evidence: EvidenceRecord;
  trustField: TrustField;
}

// ---------------------------------------------------------
// Variant-Specific Data
// ---------------------------------------------------------

export interface OpportunityData {
  price?: string;
  requiredAbilities: string[];
  estimatedTime?: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  emergenceType: "collapse" | "manual";
  originDemandSignalId?: string;
}

export interface PersonData {
  capabilities: string[];
  availability?: string;
}

// ---------------------------------------------------------
// Concrete Entities
// ---------------------------------------------------------

export interface OpportunityEntity extends BaseEntity {
  identity: IdentityLayer & { variant: "opportunity" };
  variantData: OpportunityData;
}

export interface PersonEntity extends BaseEntity {
  identity: IdentityLayer & { variant: "person" };
  variantData: PersonData;
}

export interface GhostEntity {
  identity: {
    id: string;
    variant: "ghost";
    title: string;
    subtitle: string;
  };
  visibility: {
    location: string;
    activeStatus: string;
  };
  clusterState: "ghost" | "emerging" | "critical";
  pressure: number;
  category: string;
  suppressionFactor?: number;
}

export type MarketplaceEntity = OpportunityEntity | PersonEntity | GhostEntity;
