import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBusinessOpportunities } from '@/features/opportunity';
import { StatusBadge, LoadingView, EmptyState, ScreenError } from '@/components/ui/DomainPrimitives';
import type { OpportunityCardViewModel, OpportunityLifecycleState } from '@/features/opportunity';

// ─── STATUS TABS ─────────────────────────────────────────────────────────────

type Tab = { label: string; filter?: OpportunityLifecycleState };

const TABS: Tab[] = [
  { label: 'All',       filter: undefined },
  { label: 'Draft',     filter: 'Draft' },
  { label: 'Published', filter: 'Published' },
  { label: 'Archived',  filter: 'Archived' },
];

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function OpportunitiesManagementList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  const { data: opportunities, isLoading, isError, refetch } = useBusinessOpportunities(activeTab.filter);

  const handleNew = () => router.push('/(steward)/opportunities/new');
  const handleOpen = (slug: string) => router.push(`/(steward)/opportunities/${slug}`);

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Opportunities</Text>
          <Text style={styles.subheading}>Your posted workspaces</Text>
        </View>
        <TouchableOpacity style={styles.newButton} onPress={handleNew} accessibilityLabel="Post new opportunity">
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* ── Status Tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.tab, activeTab.label === tab.label && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab.label === tab.label }}
          >
            <Text style={[styles.tabText, activeTab.label === tab.label && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ScreenError message="Could not load opportunities." onRetry={() => refetch()} />
      ) : (
        <FlatList<OpportunityCardViewModel>
          data={opportunities ?? []}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyState heading="No opportunities yet" body="Post your first opportunity and let the community find you." cta="Post an Opportunity" onCta={handleNew} />}
          renderItem={({ item }) => (
            <OpportunityCard item={item} onPress={() => handleOpen(item.slug)} />
          )}
        />
      )}
    </View>
  );
}

// ─── CARD ────────────────────────────────────────────────────────────────────

function OpportunityCard({
  item,
  onPress,
}: {
  item: OpportunityCardViewModel;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardRow}>
        <View style={styles.cardMain}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardMeta}>
            {item.isRemote ? 'Remote' : 'On-site'} · {item.priceDisplay}
          </Text>
        </View>
        <StatusBadge status={item.state} />
      </View>
    </TouchableOpacity>
  );
}



// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: '#F9FAFB' },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  heading:    { fontSize: 26, fontWeight: '800', color: '#111827' },
  subheading: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  newButton:  {
    backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 10,
  },
  newButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  tabBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingBottom: 0,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: 4,
  },
  tabActive:     { borderBottomColor: '#111827' },
  tabText:       { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#111827', fontWeight: '700' },

  list:      { padding: 16 },
  separator: { height: 10 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  cardRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardMain: { flex: 1 },
  cardTitle:{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  cardMeta: { fontSize: 13, color: '#6B7280' },

  badge:     {
    paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 20, alignSelf: 'flex-start', marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },

  empty: { paddingTop: 64, alignItems: 'center', paddingHorizontal: 32 },
  emptyHeading: {
    fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 10, textAlign: 'center',
  },
  emptyBody: {
    fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  emptyButton: {
    backgroundColor: '#111827', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12,
  },
  emptyButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  errorText: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  retryButton: {
    backgroundColor: '#F3F4F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8,
  },
  retryButtonText: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
