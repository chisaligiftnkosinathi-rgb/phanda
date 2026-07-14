/**
 * NotificationCard Component
 *
 * Displays recent notifications and unread count.
 */

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { DashboardCard } from './DashboardCard';
import type { NotificationInfo, DashboardWidget } from '@/types/dashboard';

interface NotificationCardProps {
  widget?: DashboardWidget<NotificationInfo>;
  onRetry?: () => void;
  onViewAll?: () => void;
}

export function NotificationCard({
  widget,
  onRetry,
  onViewAll,
}: NotificationCardProps) {
  if (!widget?.data) {
    return <DashboardCard title="Notifications" widget={widget} onRetry={onRetry} />;
  }

  const data = widget.data;

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'payment_received':
        return '#E8F5E9';
      case 'proof_needed':
        return '#FFF3E0';
      case 'payout_sent':
        return '#E3F2FD';
      case 'new_job':
        return '#F3E5F5';
      case 'trust_changed':
        return '#FCE4EC';
      default:
        return '#F5F5F5';
    }
  };

  const getNotificationBorderColor = (type: string): string => {
    switch (type) {
      case 'payment_received':
        return '#4CAF50';
      case 'proof_needed':
        return '#FF9800';
      case 'payout_sent':
        return '#2196F3';
      case 'new_job':
        return '#9C27B0';
      case 'trust_changed':
        return '#E91E63';
      default:
        return '#999';
    }
  };

  return (
    <DashboardCard title="Notifications" widget={widget} onRetry={onRetry}>
      <View style={styles.container}>
        {/* Unread count badge */}
        {data.total_unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{data.total_unread} Unread</Text>
          </View>
        )}

        {/* Alert badges for urgent notifications */}
        {(data.has_unread_payment || data.has_unread_proof) && (
          <View style={styles.alertSection}>
            {data.has_unread_payment && (
              <View style={styles.alertItem}>
                <Text style={styles.alertIcon}>💰</Text>
                <Text style={styles.alertText}>Payment Received</Text>
              </View>
            )}
            {data.has_unread_proof && (
              <View style={styles.alertItem}>
                <Text style={styles.alertIcon}>📸</Text>
                <Text style={styles.alertText}>Proof Verification Needed</Text>
              </View>
            )}
          </View>
        )}

        {/* Recent notifications list */}
        {data.recent.length > 0 ? (
          <View style={styles.recentList}>
            <Text style={styles.recentLabel}>Recent</Text>
            <FlatList
              data={data.recent.slice(0, 3)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.notificationItem,
                    { backgroundColor: getNotificationColor(item.type), borderLeftColor: getNotificationBorderColor(item.type) },
                  ]}
                >
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                    <Text style={styles.notificationTime}>{formatTime(item.created_at)}</Text>
                  </View>
                  {!item.read && <View style={styles.unreadIndicator} />}
                </View>
              )}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No notifications yet</Text>
          </View>
        )}

        {/* View all button */}
        {data.total_unread > 0 && (
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll} disabled={!onViewAll}>
            <Text style={styles.viewAllButtonText}>View All Notifications</Text>
          </TouchableOpacity>
        )}
      </View>
    </DashboardCard>
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  unreadBadge: {
    backgroundColor: '#E53935',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  alertSection: {
    gap: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDE7',
    borderRadius: 6,
    padding: 12,
    gap: 8,
  },
  alertIcon: {
    fontSize: 18,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  recentList: {
    gap: 8,
  },
  recentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  notificationItem: {
    flexDirection: 'row',
    borderRadius: 6,
    padding: 12,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationBody: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    marginLeft: 8,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#999',
  },
  viewAllButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
