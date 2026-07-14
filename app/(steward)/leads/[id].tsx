import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLeadDetail, useUpdateLeadStatus } from '@/features/lead';
import type { LeadStatus } from '@/features/lead';

// ─── STATUS PROGRESSION ──────────────────────────────────────────────────────

const STATUS_ACTIONS: { from: LeadStatus; to: LeadStatus; label: string }[] = [
  { from: 'New',       to: 'Viewed',    label: 'Mark as Viewed' },
  { from: 'Viewed',    to: 'Contacted', label: 'Mark as Contacted' },
  { from: 'Contacted', to: 'Quoted',    label: 'Mark as Quoted' },
  { from: 'Quoted',    to: 'Won',       label: 'Mark as Won' },
];

export default function LeadDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lead, isLoading, isError } = useLeadDetail(id ?? '');
  const updateStatus = useUpdateLeadStatus();
  const [confirming, setConfirming] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (isError || !lead) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>Could not load lead.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back to inbox</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nextAction = STATUS_ACTIONS.find((a) => a.from === lead.statusLabel);

  const handleStatusUpdate = (toStatus: LeadStatus, label: string) => {
    Alert.alert(label, `Move this lead to "${toStatus}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setConfirming(true);
          try {
            await updateStatus.mutateAsync({ leadId: lead.id, status: toStatus });
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not update lead status.');
          } finally {
            setConfirming(false);
          }
        },
      },
    ]);
  };

  const handleMarkSpam = () => {
    Alert.alert('Mark as Spam', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Spam',
        style: 'destructive',
        onPress: () => updateStatus.mutateAsync({ leadId: lead.id, status: 'Spam' }),
      },
    ]);
  };

  const receivedDate = new Date(lead.receivedAt).toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Inbox</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>{lead.contactName}</Text>
        <View style={styles.metaRow}>
          <StatusBadge status={lead.statusLabel} />
          <Text style={styles.receivedDate}>{receivedDate}</Text>
        </View>
      </View>

      {/* ── Contact ── */}
      <Section label="Contact">
        <InfoRow icon="📞" value={lead.contactPhone} />
        {lead.location !== 'Not specified' && (
          <InfoRow icon="📍" value={lead.location} />
        )}
      </Section>

      {/* ── Request ── */}
      <Section label="Request">
        <InfoRow icon="🔧" value={lead.serviceNeeded} />
        {lead.message && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>"{lead.message}"</Text>
          </View>
        )}
      </Section>

      {/* ── Source ── */}
      <Section label="Source">
        <InfoRow icon="📡" value={lead.source} />
      </Section>

      {/* ── Actions ── */}
      <View style={styles.actionsBlock}>
        {nextAction && (
          <TouchableOpacity
            style={[styles.primaryAction, (confirming || updateStatus.isPending) && styles.actionDisabled]}
            disabled={confirming || updateStatus.isPending}
            onPress={() => handleStatusUpdate(nextAction.to, nextAction.label)}
          >
            <Text style={styles.primaryActionText}>{nextAction.label}</Text>
          </TouchableOpacity>
        )}

        {lead.canQuote && (
          <TouchableOpacity
            style={styles.quoteAction}
            onPress={() => {
              // Phase C: navigate to quote creation
              // router.push({ pathname: '/(steward)/quotes/new', params: { lead_id: lead.id } });
              Alert.alert('Phase C', 'Quote Engine coming in Phase C.');
            }}
          >
            <Text style={styles.quoteActionText}>Create Quote →</Text>
          </TouchableOpacity>
        )}

        {lead.statusLabel !== 'Spam' && lead.statusLabel !== 'Won' && (
          <TouchableOpacity style={styles.spamAction} onPress={handleMarkSpam}>
            <Text style={styles.spamActionText}>Mark as Spam</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

// ─── SECTION ─────────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function InfoRow({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  New:       { bg: '#DBEAFE', text: '#1E40AF' },
  Viewed:    { bg: '#F3F4F6', text: '#374151' },
  Contacted: { bg: '#FEF9C3', text: '#92400E' },
  Quoted:    { bg: '#EDE9FE', text: '#5B21B6' },
  Won:       { bg: '#DCFCE7', text: '#166534' },
  Lost:      { bg: '#FEF2F2', text: '#991B1B' },
  Spam:      { bg: '#F3F4F6', text: '#9CA3AF' },
};

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.New;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  content:  { paddingBottom: 60 },

  header: {
    backgroundColor: '#111827', padding: 24, paddingTop: 52, paddingBottom: 28,
  },
  backRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 6 },
  backArrow:    { fontSize: 18, color: '#9CA3AF' },
  backLabel:    { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  heading:      { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  receivedDate: { fontSize: 13, color: '#9CA3AF' },

  badge:     { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },

  section:      { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  infoRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  infoIcon:  { fontSize: 16, width: 22 },
  infoValue: { fontSize: 16, color: '#374151', flex: 1 },

  messageBox: {
    backgroundColor: '#F9FAFB', borderLeftWidth: 3, borderLeftColor: '#D1D5DB',
    padding: 14, borderRadius: 8, marginTop: 8,
  },
  messageText: { fontSize: 15, color: '#374151', lineHeight: 22, fontStyle: 'italic' },

  actionsBlock: { margin: 24, gap: 10 },

  primaryAction: {
    backgroundColor: '#111827', paddingVertical: 16, borderRadius: 12, alignItems: 'center',
  },
  actionDisabled:    { backgroundColor: '#9CA3AF' },
  primaryActionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },

  quoteAction: {
    backgroundColor: '#EDE9FE', paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#DDD6FE',
  },
  quoteActionText: { color: '#5B21B6', fontWeight: '700', fontSize: 15 },

  spamAction: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#FCA5A5',
  },
  spamActionText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },

  errorText:       { fontSize: 16, color: '#6B7280', marginBottom: 16, textAlign: 'center' },
  backButton:      { backgroundColor: '#F3F4F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  backButtonText:  { fontSize: 14, fontWeight: '600', color: '#111827' },
});
