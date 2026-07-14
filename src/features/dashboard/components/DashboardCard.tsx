/**
 * DashboardCard Component
 *
 * Base wrapper for all dashboard cards.
 * Handles common canonical widget states:
 *   "snapshot" | "loading" | "live" | "refreshing" | "maintenance" | "unavailable" | "offline"
 */

import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import type { DashboardWidget } from '@/types/dashboard';

interface DashboardCardProps {
  title: string;
  widget?: DashboardWidget<any>;
  onRetry?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function DashboardCard({
  title,
  widget,
  onRetry,
  children,
  style,
}: DashboardCardProps) {
  const state = widget?.state || 'loading';
  const message = widget?.message;

  const isLoading = state === 'loading' || state === 'refreshing';
  const isError = ['unavailable', 'sessionExpired', 'forbidden', 'conflict', 'throttled', 'platformError', 'maintenance', 'offline'].includes(state);

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>

      {isLoading && !widget?.data && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color="#4CAF50" />
          {message && <Text style={styles.loadingText}>{message}</Text>}
        </View>
      )}

      {isError && !widget?.data && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{message || 'Unavailable'}</Text>
          {onRetry && state !== 'maintenance' && state !== 'forbidden' && (
            <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {(widget?.data || state === 'snapshot' || state === 'live' || state === 'refreshing') && (
        <>
          {isError && widget?.data && (
             <View style={styles.warningContainer}>
                <Text style={styles.warningText}>{message || 'Displaying cached data'}</Text>
             </View>
          )}
          {children}
        </>
      )}
    </View>
  );
}

// Default export included to satisfy Expo Router layout resolution
export default DashboardCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#FF8F00',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});