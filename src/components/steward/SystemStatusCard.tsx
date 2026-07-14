/**
 * SystemStatusCard Component
 *
 * Displays system connectivity and synchronization status.
 * Transparency about what's working and what's queued.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DashboardCard } from './DashboardCard';
import type { SystemStatus, DashboardWidget } from '@/types/dashboard';

interface SystemStatusCardProps {
  widget?: DashboardWidget<SystemStatus>;
  onRetry?: () => void;
  onViewQueue?: () => void;
}

export function SystemStatusCard({
  widget,
  onRetry,
  onViewQueue,
}: SystemStatusCardProps) {
  if (!widget?.data) {
    return <DashboardCard title="System Status" widget={widget} onRetry={onRetry} />;
  }

  const data = widget.data;

  const statusColors: Record<string, { bg: string; border: string; dot: string }> = {
    online: { bg: '#E8F5E9', border: '#4CAF50', dot: '#4CAF50' },
    degraded: { bg: '#FFF3E0', border: '#FF9800', dot: '#FF9800' },
    offline: { bg: '#FFEBEE', border: '#F44336', dot: '#F44336' },
  };

  const colors = statusColors[data.status] || statusColors.offline;

  const lastSyncTime = formatLastSync(data.last_sync);

  return (
    <DashboardCard title="System Status" widget={widget} onRetry={onRetry}>
      <View style={styles.container}>
        {/* Status indicator */}
        <View style={[styles.statusSection, { backgroundColor: colors.bg, borderLeftColor: colors.border }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, { backgroundColor: colors.dot }]} />
            <Text style={[styles.statusText, { color: colors.border }]}>{data.status.toUpperCase()}</Text>
          </View>

          {data.status === 'online' && (
            <Text style={styles.statusSubtext}>All systems operational</Text>
          )}

          {data.status === 'degraded' && (
            <Text style={styles.statusSubtext}>Some features may be slow</Text>
          )}

          {data.status === 'offline' && (
            <Text style={[styles.statusSubtext, { color: '#C62828' }]}>
              No connection. Data will sync when online.
            </Text>
          )}
        </View>

        {/* Sync information */}
        <View style={styles.syncSection}>
          <View style={styles.syncItem}>
            <Text style={styles.syncLabel}>Last Sync</Text>
            <Text style={styles.syncValue}>{lastSyncTime}</Text>
          </View>

          {data.pending_sync_count > 0 && (
            <View style={styles.syncItem}>
              <Text style={styles.syncLabel}>Pending</Text>
              <Text style={[styles.syncValue, { color: '#FF9800' }]}>{data.pending_sync_count} items</Text>
            </View>
          )}

          {data.sync_in_progress && (
            <View style={styles.syncItem}>
              <Text style={styles.syncLabel}>Status</Text>
              <Text style={[styles.syncValue, { color: '#2196F3' }]}>Syncing...</Text>
            </View>
          )}
        </View>

        {/* Queue info when relevant */}
        {data.pending_sync_count > 0 && (
          <TouchableOpacity
            style={styles.queueButton}
            onPress={onViewQueue}
            disabled={!onViewQueue}
          >
            <Text style={styles.queueButtonText}>View Sync Queue ({data.pending_sync_count})</Text>
          </TouchableOpacity>
        )}

        {/* API health indicator */}
        <View style={styles.healthIndicator}>
          <Text style={styles.healthLabel}>Backend</Text>
          <View style={styles.healthStatus}>
            <View style={[styles.healthDot, { backgroundColor: data.api_healthy ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.healthValue}>{data.api_healthy ? 'Healthy' : 'Unreachable'}</Text>
          </View>
        </View>
      </View>
    </DashboardCard>
  );
}

function formatLastSync(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 10) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  statusSection: {
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#666',
  },
  syncSection: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  syncItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncLabel: {
    fontSize: 12,
    color: '#999',
  },
  syncValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  queueButton: {
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  queueButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  healthIndicator: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
  },
  healthLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
