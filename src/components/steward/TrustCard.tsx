/**
 * TrustCard Component
 *
 * Displays trust score, verification status, and visibility.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardCard } from './DashboardCard';
import type { TrustInfo, DashboardWidget } from '@/types/dashboard';

interface TrustCardProps {
  widget?: DashboardWidget<TrustInfo>;
  onRetry?: () => void;
}

export function TrustCard({ widget, onRetry }: TrustCardProps) {
  if (!widget?.data) {
    return <DashboardCard title="Business Trust" widget={widget} onRetry={onRetry} />;
  }

  const data = widget.data;
  const score = data.score.overall_score;
  const scoreColor = score >= 70 ? '#4CAF50' : score >= 40 ? '#FF9800' : '#F44336';

  return (
    <DashboardCard title="Business Trust" widget={widget} onRetry={onRetry}>
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{Math.round(score)}</Text>
        </View>
        <View style={styles.scoreDetails}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusValue}>{data.verification_required ? 'Verification Needed' : 'Verified'}</Text>
        </View>
      </View>

      <View style={styles.visibilityContainer}>
        <Text style={styles.visibilityLabel}>Visibility</Text>
        <Text style={styles.visibilityValue}>{data.visibility.is_visible ? 'Visible' : 'Hidden'}</Text>
        {data.visibility.visibility_reason && <Text style={styles.visibilityReason}>{data.visibility.visibility_reason}</Text>}
      </View>

      <View style={styles.componentsList}>
        <Text style={styles.componentsLabel}>Score Breakdown</Text>
        <View style={styles.componentRow}>
          <Text style={styles.componentName}>Verification Score</Text>
          <Text style={styles.componentValue}>{Math.round(data.score.verification_score)}%</Text>
        </View>
        <View style={styles.componentRow}>
          <Text style={styles.componentName}>Completion Score</Text>
          <Text style={styles.componentValue}>{Math.round(data.score.completion_score)}%</Text>
        </View>
        <View style={styles.componentRow}>
          <Text style={styles.componentName}>Visibility Score</Text>
          <Text style={styles.componentValue}>{Math.round(data.score.visibility_score)}%</Text>
        </View>
        <View style={styles.componentRow}>
          <Text style={styles.componentName}>Successful Payments</Text>
          <Text style={styles.componentValue}>{data.score.components.successful_payments}</Text>
        </View>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
  },
  scoreDetails: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  visibilityContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  visibilityLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  visibilityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  visibilityReason: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  componentsList: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  componentsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  componentName: {
    fontSize: 13,
    color: '#666',
  },
  componentValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});
