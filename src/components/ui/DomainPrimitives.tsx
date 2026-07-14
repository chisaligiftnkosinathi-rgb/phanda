/**
 * Shared UI primitives for domain screens.
 *
 * These components emerged from the Opportunity and Lead engines.
 * Every domain screen should use these rather than re-implementing them.
 *
 * Baseline v1.0: patterns that appear in two or more domains belong here.
 */
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

export type StatusColorMap = Record<string, { bg: string; text: string }>;

/**
 * Renders a coloured pill badge for any domain lifecycle status.
 * Pass a `colorMap` to override defaults for domain-specific statuses.
 */
export function StatusBadge({
  status,
  colorMap = {},
}: {
  status: string;
  colorMap?: StatusColorMap;
}) {
  const colors = colorMap[status] ?? DEFAULT_COLORS[status] ?? DEFAULT_COLORS._fallback;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

// Shared status colours that appear across Opportunity + Lead domains
export const DEFAULT_COLORS: StatusColorMap = {
  // Opportunity lifecycle
  Draft:              { bg: '#F3F4F6', text: '#374151' },
  Published:          { bg: '#DCFCE7', text: '#166534' },
  Visible:            { bg: '#DCFCE7', text: '#166534' },
  'Receiving Leads':  { bg: '#DCFCE7', text: '#166534' },
  Archived:           { bg: '#FEF2F2', text: '#991B1B' },
  Completed:          { bg: '#EDE9FE', text: '#5B21B6' },
  Reflected:          { bg: '#EDE9FE', text: '#5B21B6' },
  // Lead lifecycle
  New:                { bg: '#DBEAFE', text: '#1E40AF' },
  Viewed:             { bg: '#F3F4F6', text: '#374151' },
  Contacted:          { bg: '#FEF9C3', text: '#92400E' },
  Quoted:             { bg: '#EDE9FE', text: '#5B21B6' },
  Won:                { bg: '#DCFCE7', text: '#166534' },
  Lost:               { bg: '#FEF2F2', text: '#991B1B' },
  Spam:               { bg: '#F3F4F6', text: '#9CA3AF' },
  // Quote lifecycle (Phase C)
  Sent:               { bg: '#DBEAFE', text: '#1E40AF' },
  Accepted:           { bg: '#DCFCE7', text: '#166534' },
  Rejected:           { bg: '#FEF2F2', text: '#991B1B' },
  Expired:            { bg: '#FEF9C3', text: '#92400E' },
  // Fallback
  _fallback:          { bg: '#DBEAFE', text: '#1E40AF' },
};

// ─── LOADING VIEW ─────────────────────────────────────────────────────────────

/**
 * Full-screen loading state with an optional message.
 */
export function LoadingView({ message }: { message?: string }) {
  return (
    <View style={[styles.centered, styles.fill]}>
      <ActivityIndicator size="large" color="#111827" />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

/**
 * Standard empty-state layout: heading + body + optional CTA.
 */
export function EmptyState({
  heading,
  body,
  cta,
  onCta,
}: {
  heading: string;
  body: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <View style={[styles.centered, styles.emptyPadding]}>
      <Text style={styles.emptyHeading}>{heading}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {cta && onCta && (
        <TouchableOpacity style={styles.ctaButton} onPress={onCta}>
          <Text style={styles.ctaButtonText}>{cta}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── SCREEN ERROR ─────────────────────────────────────────────────────────────

/**
 * Inline error state with an optional retry button.
 */
export function ScreenError({
  message = 'Something went wrong.',
  onRetry,
  retryLabel = 'Retry',
}: {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <View style={[styles.centered, styles.fill]}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill:         { flex: 1 },
  centered:     { justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyPadding: { paddingTop: 64, paddingHorizontal: 32 },

  badge:     { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },

  loadingText:  { marginTop: 12, fontSize: 14, color: '#6B7280' },

  emptyHeading: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 10, textAlign: 'center' },
  emptyBody:    { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 28 },

  ctaButton:     { backgroundColor: '#111827', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  ctaButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  errorText:       { fontSize: 16, color: '#6B7280', marginBottom: 16, textAlign: 'center' },
  retryButton:     { backgroundColor: '#F3F4F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  retryButtonText: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
