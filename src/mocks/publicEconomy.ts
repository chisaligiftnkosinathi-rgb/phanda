import { MarketplaceEntity, OpportunityEntity, PersonEntity } from "@/types/marketplace";

export const mockOpportunities: OpportunityEntity[] = [
  {
    identity: {
      id: "opp-1",
      variant: "opportunity",
      title: "Outside Tap Installation",
      subtitle: "Requested by Sipho Ndlovu",
    },
    visibility: {
      location: "Mamelodi East",
      activeStatus: "Today",
    },
    evidence: {
      completedCount: 18,
      verificationLevel: 2,
      items: [
        {
          id: "ev-1",
          type: "photo",
          beforeUri: "mock-before",
          afterUri: "mock-after",
          timestamp: "2 days ago",
          verified: true,
        },
        {
          id: "ev-2",
          type: "photo",
          afterUri: "mock-after",
          timestamp: "1 week ago",
          verified: true,
        }
      ]
    },
    trustField: {
      value: 98,
      velocity: 2.5,
      acceleration: 0.1,
      stability: 0.9,
      lastUpdated: new Date().toISOString(),
      anchorClass: 'ANCHOR',
    },
    variantData: {
      price: "R450",
      urgency: "HIGH",
      requiredAbilities: ["Plumber"],
      estimatedTime: "2 hours",
      createdAt: "2h ago",
      emergenceType: "manual",
    }
  },
  {
    identity: {
      id: "opp-2",
      variant: "opportunity",
      title: "Need logo design for small business",
      subtitle: "Requested by Sarah J.",
    },
    visibility: {
      location: "Remote",
      activeStatus: "Today",
    },
    evidence: {
      completedCount: 4,
      verificationLevel: 1,
      items: [
        {
          id: "ev-3",
          type: "photo",
          afterUri: "mock-after",
          timestamp: "3 days ago",
          verified: true,
        }
      ]
    },
    trustField: {
      value: 45,
      velocity: 15.0,
      acceleration: 5.0,
      stability: 0.2,
      lastUpdated: new Date().toISOString(),
      anchorClass: 'EMERGING',
    },
    variantData: {
      price: "R300",
      urgency: "MEDIUM",
      requiredAbilities: ["Graphic Design", "Logo Design"],
      estimatedTime: "1 day",
      createdAt: "5h ago",
      emergenceType: "manual",
    }
  },
  {
    identity: {
      id: "opp-3",
      variant: "opportunity",
      title: "Delivery assistant needed (weekend)",
      subtitle: "Requested by T&T Logistics",
    },
    visibility: {
      location: "Centurion",
      activeStatus: "Upcoming Weekend",
    },
    evidence: {
      completedCount: 42,
      verificationLevel: 3,
    },
    trustField: {
      value: 99,
      velocity: 1.0,
      acceleration: 0.0,
      stability: 0.95,
      lastUpdated: new Date().toISOString(),
      anchorClass: 'ANCHOR',
    },
    variantData: {
      price: "R150/day",
      urgency: "LOW",
      requiredAbilities: ["Heavy Lifting", "Driver Assistant"],
      createdAt: "1d ago",
      emergenceType: "manual",
    }
  },
];

export const mockPeople: PersonEntity[] = [
  {
    identity: {
      id: "person-1",
      variant: "person",
      title: "Sipho Ndlovu",
      subtitle: "Plumber",
    },
    visibility: {
      location: "Pretoria",
      activeStatus: "Active today",
    },
    evidence: {
      completedCount: 127,
      verificationLevel: 3,
      items: [
        {
          id: "ev-10",
          type: "photo",
          beforeUri: "mock-before",
          afterUri: "mock-after",
          timestamp: "Yesterday",
          verified: true,
        },
        {
          id: "ev-11",
          type: "photo",
          beforeUri: "mock-before",
          afterUri: "mock-after",
          timestamp: "4 days ago",
          verified: true,
        }
      ]
    },
    trustField: {
      value: 88,
      velocity: 4.2,
      acceleration: -0.5,
      stability: 0.7,
      lastUpdated: new Date().toISOString(),
      anchorClass: 'PROVEN',
    },
    variantData: {
      capabilities: ["Plumbing", "Leak Repair", "Installations"],
    }
  },
  {
    identity: {
      id: "person-2",
      variant: "person",
      title: "Aisha K.",
      subtitle: "UI Designer",
    },
    visibility: {
      location: "Remote",
      activeStatus: "Active 2h ago",
    },
    evidence: {
      completedCount: 34,
      verificationLevel: 2,
    },
    trustField: {
      value: 25,
      velocity: -5.0,
      acceleration: -2.0,
      stability: 0.1,
      lastUpdated: new Date().toISOString(),
      anchorClass: 'UNSTABLE',
    },
    variantData: {
      capabilities: ["UI/UX Design", "Figma", "Web Design"],
    }
  },
];

import { TrustEdge } from '@/types/trustGraph';

export const mockTrustEdges: TrustEdge[] = [
  {
    id: "person-1_opp-1",
    fromEntityId: "person-1", // Sipho
    toEntityId: "opp-1",      // The job requester
    weight: 0.8,
    interactions: 5,
    successRate: 1.0,
    lastInteraction: new Date().toISOString(),
  },
  {
    id: "person-2_person-1",
    fromEntityId: "person-2", // Aisha
    toEntityId: "person-1",   // Trusts Sipho
    weight: 0.6,
    interactions: 2,
    successRate: 1.0,
    lastInteraction: new Date(Date.now() - 86400000).toISOString(),
  }
];
