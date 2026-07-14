/**
 * WorkCard Component
 *
 * Displays current work opportunities and status.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DashboardCard } from './DashboardCard';
import type { OpportunityInfo, DashboardWidget } from '@/types/dashboard';

interface WorkCardProps {
  widget?: DashboardWidget<OpportunityInfo>;
  onRetry?: () => void;
  onBrowseOpportunities?: () => void;
  onViewActiveJobs?: () => void;
}

export function WorkCard({
  widget,
  onRetry,
  onBrowseOpportunities,
  onViewActiveJobs,
}: WorkCardProps) {
  if (!widget?.data) {
    return <DashboardCard title="Work" widget={widget} onRetry={onRetry} />;
  }

  const data = widget.data;

  const hasActiveWork = data.active_jobs > 0 || data.pending_proof_count > 0;

  return (
    <DashboardCard title="Work" widget={widget} onRetry={onRetry}>
      <View style={styles.container}>
        {/* Current jobs status */}
        {hasActiveWork && (
          <View style={styles.activeSection}>
            <Text style={styles.activeLabel}>Active Jobs</Text>
            {data.active_jobs > 0 && (
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>In Progress: {data.active_jobs}</Text>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={onViewActiveJobs}
                  disabled={!onViewActiveJobs}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            )}
            {data.pending_proof_count > 0 && (
              <View style={[styles.statusRow, styles.pendingRow]}>
                <Text style={styles.pendingText}>Awaiting Proof: {data.pending_proof_count}</Text>
              </View>
            )}
          </View>
        )}

        {/* Available opportunities */}
        {data.total_available > 0 && (
          <View style={styles.availableSection}>
            <Text style={styles.availableLabel}>Available Opportunities</Text>
            <Text style={styles.availableCount}>{data.total_available} Available</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={onBrowseOpportunities}
              disabled={!onBrowseOpportunities}
            >
              <Text style={styles.browseButtonText}>Browse Opportunities</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Completed today */}
        {data.completed_today > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.completedLabel}>Completed Today</Text>
            <Text style={styles.completedCount}>{data.completed_today}</Text>
          </View>
        )}

        {!hasActiveWork && data.total_available === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No opportunities available at the moment</Text>
            <Text style={styles.emptyStateSubtext}>Check back later or adjust your preferences</Text>
          </View>
        )}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  activeSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  pendingRow: {
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    marginTop: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#D84315',
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  availableSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  availableLabel: {
    fontSize: 12,
    color: '#1565C0',
    marginBottom: 6,
  },
  availableCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D47A1',
    marginBottom: 12,
  },
  browseButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completedSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 12,
  },
  completedLabel: {
    fontSize: 12,
    color: '#999',
  },
  completedCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#999',
  },
});
