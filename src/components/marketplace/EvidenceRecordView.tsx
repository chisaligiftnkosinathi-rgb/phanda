import React from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { EvidenceRecord, TrustField } from '@/types/marketplace';
import { BadgeState } from '@/hooks/useTrustResumeAnimation';

interface EvidenceRecordViewProps {
  evidence: EvidenceRecord;
  trustField: TrustField;
  badgeState?: BadgeState;
}

export function EvidenceRecordView({ evidence, trustField, badgeState = 'HIDDEN' }: EvidenceRecordViewProps) {
  const hasItems = evidence.items && evidence.items.length > 0;
  
  // Anchor Class Rules
  const isUnstable = trustField.anchorClass === 'UNSTABLE';
  const showEvidenceGallery = !isUnstable && trustField.anchorClass !== 'EMERGING';

  return (
    <View style={[styles.container, isUnstable && styles.unstableContainer]}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeader}>Evidence from similar work</Text>
        
        {badgeState === 'IMMEDIATE' && (
          <View style={[styles.verifiedBadge, styles.immediateBadge]}>
            <Text style={[styles.verifiedText, styles.immediateText]}>✓ Action Verified</Text>
          </View>
        )}
        {badgeState === 'SETTLED' && (
          <View style={[styles.verifiedBadge, styles.settledBadge]}>
            <Text style={[styles.verifiedText, styles.settledText]}>✓ Verified</Text>
          </View>
        )}
      </View>
      
      {hasItems && showEvidenceGallery && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {evidence.items!.map((item) => (
            <View key={item.id} style={styles.galleryItem}>
              {item.type === 'photo' && item.afterUri && (
                <View style={styles.photoContainer}>
                  {item.beforeUri && (
                    <View style={styles.photoWrapper}>
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoLabel}>Before</Text>
                      </View>
                    </View>
                  )}
                  <View style={styles.photoWrapper}>
                    <View style={[styles.photoPlaceholder, styles.photoPlaceholderSuccess]}>
                      <Text style={styles.photoLabel}>After</Text>
                    </View>
                  </View>
                </View>
              )}
              
              <View style={styles.itemFooter}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                {item.verified && (
                  <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>✓</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={styles.trustScoreContainer}>
            <Text style={[styles.statValue, isUnstable && styles.unstableText]}>
              {Math.round(trustField.value)}%
            </Text>
            {badgeState === 'MEMORY' && <Text style={styles.memoryTick}>✓</Text>}
          </View>
          <Text style={styles.statLabel}>Trust Field</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{evidence.completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  unstableContainer: {
    opacity: 0.7,
    backgroundColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unstableText: {
    color: '#9CA3AF',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  immediateBadge: {
    backgroundColor: '#10B981', // Solid Green
  },
  immediateText: {
    color: '#FFFFFF',
  },
  settledBadge: {
    backgroundColor: '#D1FAE5', // Muted green
  },
  settledText: {
    color: '#065F46',
  },
  itemBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemBadgeText: {
    fontSize: 10,
    color: '#03543F',
    fontWeight: '700',
  },
  gallery: {
    marginBottom: 16,
  },
  galleryItem: {
    marginRight: 16,
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  photoContainer: {
    flexDirection: 'row',
    height: 120,
  },
  photoWrapper: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderSuccess: {
    backgroundColor: '#F0FDF4',
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  itemFooter: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  trustScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  memoryTick: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
