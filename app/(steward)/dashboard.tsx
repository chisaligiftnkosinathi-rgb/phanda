/**
 * Steward Dashboard Screen
 *
 * The operating system of the steward's business.
 * Authenticated stewards land here after login.
 *
 * From here they can reach:
 *   - Capture Companion
 *   - Timeline
 *   - Opportunities & Wallet
 *   - Trust, Notifications, System Status
 *
 * Widget doctrine:
 *   Hiding a widget is a PRESENTATION decision.
 *   It does not delete or modify any underlying data.
 *   Each widget can be restored at any time via "Manage Widgets".
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardStore, WidgetId, WIDGET_LABELS } from '@/state/useDashboardStore';
import { TrustCard } from '@/components/steward/TrustCard';
import { WalletCard } from '@/components/steward/WalletCard';
import { WorkCard } from '@/components/steward/WorkCard';
import { NotificationCard } from '@/components/steward/NotificationCard';
import { SystemStatusCard } from '@/components/steward/SystemStatusCard';

export default function DashboardScreen() {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useDashboard();

  // Widget visibility
  const isVisible      = useDashboardStore((s) => s.isVisible);
  const hideWidget     = useDashboardStore((s) => s.hideWidget);
  const showWidget     = useDashboardStore((s) => s.showWidget);
  const showAllWidgets = useDashboardStore((s) => s.showAllWidgets);
  const hiddenWidgets  = useDashboardStore((s) => s.hiddenWidgets);

  // Widget menu state
  const [menuWidget, setMenuWidget] = useState<WidgetId | null>(null);

  const handleRefresh = () => refetch();

  const handleRequestPayout = () => {
    console.log('Request payout');
  };

  const handleBrowseOpportunities = () => {
    console.log('Browse opportunities');
  };

  const handleViewActiveJobs = () => {
    console.log('View active jobs');
  };

  const handleViewNotifications = () => {
    console.log('View all notifications');
  };

  const handleViewSyncQueue = () => {
    console.log('View sync queue');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  /** Renders the ··· menu button attached to a widget card */
  const WidgetMenu = ({ id }: { id: WidgetId }) => (
    <TouchableOpacity
      style={styles.widgetMenuBtn}
      onPress={() => setMenuWidget(id)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.widgetMenuDots}>···</Text>
    </TouchableOpacity>
  );

  if (!data && isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.businessName}>{data?.merchant?.data?.account_holder_name || 'Your Business'}</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Capture Companion shortcut */}
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={() => router.push('/(companion)' as const)}
            >
              <Text style={styles.captureBtnText}>+ Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={isRefetching}>
              <Text style={styles.refreshButtonText}>↻</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync information */}
        {data?.timestamp && (
          <View style={styles.syncInfo}>
            <Text style={styles.syncText}>Last updated {formatTimeDifference(data.timestamp)}</Text>
          </View>
        )}

        {/* Business Trust Status */}
        {isVisible('trust') && (
          <View style={styles.widgetWrapper}>
            <WidgetMenu id="trust" />
            <TrustCard
              widget={data?.trust}
              onRetry={refetch}
            />
          </View>
        )}

        {/* Wallet */}
        {isVisible('wallet') && (
          <View style={styles.widgetWrapper}>
            <WidgetMenu id="wallet" />
            <WalletCard
              widget={data?.wallet}
              onRetry={refetch}
              onRequestPayout={handleRequestPayout}
            />
          </View>
        )}

        {/* Work */}
        {isVisible('work') && (
          <View style={styles.widgetWrapper}>
            <WidgetMenu id="work" />
            <WorkCard
              widget={data?.opportunities}
              onRetry={refetch}
              onBrowseOpportunities={handleBrowseOpportunities}
              onViewActiveJobs={handleViewActiveJobs}
            />
          </View>
        )}

        {/* Notifications */}
        {isVisible('notifications') && (
          <View style={styles.widgetWrapper}>
            <WidgetMenu id="notifications" />
            <NotificationCard
              widget={data?.notifications}
              onRetry={refetch}
              onViewAll={handleViewNotifications}
            />
          </View>
        )}

        {/* System Status */}
        {isVisible('systemStatus') && (
          <View style={styles.widgetWrapper}>
            <WidgetMenu id="systemStatus" />
            <SystemStatusCard
              widget={data?.systemHealth}
              onRetry={refetch}
              onViewQueue={handleViewSyncQueue}
            />
          </View>
        )}

        {/* Manage Widgets — only shown when widgets are hidden */}
        {hiddenWidgets.length > 0 && (
          <View style={styles.manageSection}>
            <View style={styles.manageSectionHeader}>
              <Text style={styles.manageSectionTitle}>Hidden Widgets</Text>
              <TouchableOpacity onPress={showAllWidgets}>
                <Text style={styles.restoreAll}>Restore all</Text>
              </TouchableOpacity>
            </View>
            {hiddenWidgets.map((wid) => (
              <View key={wid} style={styles.hiddenWidgetRow}>
                <Text style={styles.hiddenWidgetLabel}>{WIDGET_LABELS[wid]}</Text>
                <TouchableOpacity
                  style={styles.restoreBtn}
                  onPress={() => showWidget(wid)}
                >
                  <Text style={styles.restoreBtnText}>+ Restore</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Widget action modal */}
      <Modal
        visible={menuWidget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuWidget(null)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuWidget(null)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {menuWidget && (
                  <>
                    <Text style={styles.sheetTitle}>{WIDGET_LABELS[menuWidget]}</Text>
                    <Pressable
                      style={styles.sheetAction}
                      onPress={() => {
                        hideWidget(menuWidget);
                        setMenuWidget(null);
                      }}
                    >
                      <Text style={styles.sheetActionText}>Remove from Dashboard</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.sheetAction, styles.sheetCancel]}
                      onPress={() => setMenuWidget(null)}
                    >
                      <Text style={styles.sheetCancelText}>Cancel</Text>
                    </Pressable>
                    <Text style={styles.sheetDoctrine}>
                      Your data is preserved. Only this widget's visibility changes.
                    </Text>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

function formatTimeDifference(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  businessName: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captureBtn: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  captureBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  refreshButtonText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
  },
  syncInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  syncText: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },

  // Widget wrapper â€” positions the Â·Â·Â· menu button
  widgetWrapper: {
    position: 'relative',
    marginBottom: 0,
  },
  widgetMenuBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  widgetMenuDots: {
    fontSize: 18,
    color: '#D1D5DB',
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Manage Widgets section
  manageSection: {
    marginTop: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  manageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  manageSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  restoreAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  hiddenWidgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  hiddenWidgetLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  restoreBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  restoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  bottomSpacer: {
    height: 20,
  },

  // Modal / action sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sheetAction: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetActionText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  sheetCancel: {
    alignItems: 'center',
    marginTop: 8,
    borderBottomWidth: 0,
  },
  sheetCancelText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  sheetDoctrine: {
    fontSize: 11,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
