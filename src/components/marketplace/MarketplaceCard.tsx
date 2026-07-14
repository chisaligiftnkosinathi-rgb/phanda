import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MarketplaceEntity, OpportunityEntity, PersonEntity, OpportunityData, GhostEntity, PersonData } from '@/types/marketplace';
import { EvidenceRecordView } from './EvidenceRecordView';
import { useRequireIdentity } from '@/utils/useRequireIdentity';
import { useTrustResumeAnimation } from '@/hooks/useTrustResumeAnimation';

interface MarketplaceCardProps {
  entity: MarketplaceEntity;
  onPress?: () => void;
}

export function MarketplaceCard({ entity, onPress }: MarketplaceCardProps) {
  const isOpportunity = entity.identity.variant === 'opportunity';
  const { scale, opacity, pulseOpacity, badgeState } = useTrustResumeAnimation(entity.identity.id);

  return (
    <Animated.View style={[styles.cardContainer, { opacity, transform: [{ scale }] }]}>
      {/* The pulse ring that fires on CONFIRM_BIND */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.pulseRing, { opacity: pulseOpacity }]} />

      <View style={styles.card}>
        <IdentitySection identity={entity.identity} visibility={entity.visibility} />
        
        {isOpportunity ? (
          <OpportunityDetails data={(entity as OpportunityEntity).variantData} />
        ) : (
          <PersonDetails data={(entity as PersonEntity).variantData} />
        )}

        {entity.identity.variant === 'ghost' && (
          <GhostDetails data={entity as unknown as GhostEntity} />
        )}

        {entity.identity.variant !== 'ghost' && (
          <EvidenceRecordView evidence={(entity as any).evidence} trustField={(entity as any).trustField} badgeState={badgeState} />
        )}

        {entity.identity.variant !== 'ghost' && (
          <ActionSection variant={entity.identity.variant} entityId={entity.identity.id} onPress={onPress} />
        )}
      </View>
    </Animated.View>
  );
}

// ------------------------------------------------------------------
// Internal Sections
// ------------------------------------------------------------------

function IdentitySection({ identity, visibility }: { identity: any; visibility: any }) {
  return (
    <View style={styles.identityContainer}>
      <Text style={styles.title}>{identity.title}</Text>
      {identity.subtitle && <Text style={styles.subtitle}>{identity.subtitle}</Text>}
      
      <View style={styles.visibilityRow}>
        <Text style={styles.locationText}>📍 {visibility.location}</Text>
        {visibility.activeStatus && (
          <Text style={styles.activeStatusText}> • {visibility.activeStatus}</Text>
        )}
      </View>
    </View>
  );
}

function OpportunityDetails({ data }: { data: OpportunityData }) {
  const isEmergent = data.emergenceType === 'collapse';

  return (
    <View style={styles.variantContainer}>
      {isEmergent && (
        <View style={styles.emergentBadge}>
          <Text style={styles.emergentBadgeText}>✨ EMERGING NEED DETECTED</Text>
        </View>
      )}

      <View style={styles.traitsRow}>
        {data.price && (
          <View style={[styles.traitBadge, styles.priceBadge]}>
            <Text style={styles.priceText}>💰 {data.price}</Text>
          </View>
        )}
        <View style={styles.traitBadge}>
          <Text style={styles.traitText}>{data.urgency} URGENCY</Text>
        </View>
        {data.estimatedTime && (
          <View style={styles.traitBadge}>
            <Text style={styles.traitText}>⏱ {data.estimatedTime}</Text>
          </View>
        )}
      </View>

      {data.requiredAbilities && data.requiredAbilities.length > 0 && (
        <View style={styles.capabilitiesList}>
          <Text style={styles.sectionHeader}>Needs</Text>
          <Text style={styles.capabilityItem}>{data.requiredAbilities.join(', ')}</Text>
        </View>
      )}
    </View>
  );
}

function GhostDetails({ data }: { data: GhostEntity }) {
  const [reinforced, setReinforced] = React.useState(false);

  const handleReinforce = () => {
    // Note: In real app, this triggers useAuthBridgeStore first, then API
    setReinforced(true);
  };

  const isSuppressed = data.suppressionFactor && data.suppressionFactor > 0.5;

  return (
    <View style={styles.ghostContainer}>
      {isSuppressed && (
        <View style={styles.suppressionBadge}>
          <Text style={styles.suppressionText}>⚠️ Overloaded Area / Delayed Fulfillment</Text>
        </View>
      )}

      <Text style={styles.ghostStatusText}>
        {reinforced ? "✨ You are strengthening this emerging need" : "Something is forming here..."}
      </Text>
      
      <View style={styles.ghostActionRow}>
        <TouchableOpacity 
          style={[styles.ghostButton, reinforced && styles.ghostButtonActive]}
          onPress={handleReinforce}
          disabled={reinforced}
        >
          <Text style={[styles.ghostButtonText, reinforced && styles.ghostButtonTextActive]}>
            {reinforced ? "Intent Expressed" : "I can help with this"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PersonDetails({ data }: { data: PersonData }) {
  if (!data.capabilities || data.capabilities.length === 0) return null;
  
  return (
    <View style={styles.variantContainer}>
      <View style={styles.capabilitiesList}>
        <Text style={styles.sectionHeader}>Specialises in</Text>
        {data.capabilities.map((cap: string, i: number) => (
          <Text key={i} style={styles.capabilityItem}>• {cap}</Text>
        ))}
      </View>
    </View>
  );
}

function ActionSection({ variant, entityId, onPress }: { variant: string; entityId: string; onPress?: () => void }) {
  const requireIdentity = useRequireIdentity();
  const label = variant === 'opportunity' ? 'Accept Opportunity' : 'View Profile';
  
  const handlePress = () => {
    if (onPress) {
      requireIdentity(onPress, {
        returnPath: variant === 'opportunity' ? '/(public)/work' : '/(public)/people',
        label: label,
        entityId: entityId
      });
    }
  };

  return (
    <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    borderRadius: 16,
  },
  pulseRing: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#10B981', // Green pulse
    transform: [{ scale: 1.05 }],
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  
  // Identity
  identityContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  activeStatusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },

  // Variant specifics
  variantContainer: {
    marginBottom: 16,
  },
  emergentBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  emergentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  ghostContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  ghostStatusText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  ghostActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  ghostButtonActive: {
    backgroundColor: '#E5E7EB',
    borderColor: '#9CA3AF',
  },
  ghostButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  ghostButtonTextActive: {
    color: '#374151',
  },
  suppressionBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  suppressionText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  traitBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
  },
  priceBadge: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  traitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  capabilitiesList: {
    marginTop: 4,
  },
  capabilityItem: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 4,
  },

  // Action
  actionButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
