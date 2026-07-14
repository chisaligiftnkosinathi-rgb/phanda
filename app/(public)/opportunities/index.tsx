import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePublicOpportunityFeed, type PublicFeedFilters } from '@/features/opportunity';
import type { OpportunityCardViewModel } from '@/features/opportunity';

// ─── PROVINCE QUICK-FILTERS ───────────────────────────────────────────────────

const PROVINCES = ['All', 'Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Eastern Cape'];

// ─── SCREEN ──────────────────────────────────────────────────────────────────

export default function PublicOpportunitiesFeed() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');

  const filters: PublicFeedFilters = {
    province: selectedProvince !== 'All' ? selectedProvince : undefined,
  };

  const { data: opportunities, isLoading, isError, refetch } = usePublicOpportunityFeed(filters);

  // Client-side title search on top of the server-filtered results
  const displayed = (opportunities ?? []).filter((o: OpportunityCardViewModel) =>
    searchText.length === 0 ||
    o.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpen = (slug: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push({ pathname: '/(public)/opportunities/[slug]' as any, params: { slug } });

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.heading}>Discover Opportunities</Text>
        <Text style={styles.subheading}>Find work near you</Text>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search opportunities..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            accessibilityLabel="Search opportunities"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Province Filter ── */}
      <View>
        <FlatList
          data={PROVINCES}
          keyExtractor={(p) => p}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.provinceList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedProvince === item && styles.chipActive]}
              onPress={() => setSelectedProvince(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedProvince === item }}
            >
              <Text style={[styles.chipText, selectedProvince === item && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Results ── */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.loadingText}>Finding opportunities...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load opportunities.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<OpportunityCardViewModel>
          data={displayed}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            displayed.length > 0 ? (
              <Text style={styles.resultCount}>{displayed.length} opportunit{displayed.length === 1 ? 'y' : 'ies'}</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyHeading}>No opportunities found</Text>
              <Text style={styles.emptyBody}>
                {searchText.length > 0
                  ? `No results for "${searchText}". Try a different search.`
                  : 'No opportunities in this area yet. Check back soon.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <DiscoveryCard item={item} onPress={() => handleOpen(item.slug)} />
          )}
        />
      )}
    </View>
  );
}

// ─── DISCOVERY CARD ──────────────────────────────────────────────────────────

function DiscoveryCard({
  item,
  onPress,
}: {
  item: OpportunityCardViewModel;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardInner}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.metaTag}>{item.isRemote ? '🌐 Remote' : '📍 On-site'}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaPrice}>{item.priceDisplay}</Text>
          </View>
        </View>
        <View style={styles.cardArrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#F9FAFB' },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  header: {
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
    backgroundColor: '#111827',
  },
  heading:    { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  subheading: { fontSize: 14, color: '#9CA3AF', marginTop: 2 },

  searchRow: { backgroundColor: '#111827', paddingHorizontal: 16, paddingBottom: 16 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  clearIcon:   { fontSize: 14, color: '#9CA3AF', paddingHorizontal: 4 },

  provinceList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingVertical: 7, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive:     { backgroundColor: '#111827', borderColor: '#111827' },
  chipText:       { fontSize: 13, fontWeight: '500', color: '#374151' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },

  resultCount: { fontSize: 13, color: '#6B7280', marginBottom: 12, paddingHorizontal: 4 },

  list:      { padding: 16 },
  separator: { height: 10 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  cardBody:  { flex: 1, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaTag:   { fontSize: 13, color: '#6B7280' },
  metaDot:   { fontSize: 13, color: '#D1D5DB' },
  metaPrice: { fontSize: 13, fontWeight: '600', color: '#374151' },

  cardArrow: { paddingLeft: 12 },
  arrowText: { fontSize: 22, color: '#9CA3AF', fontWeight: '300' },

  empty: { paddingTop: 48, alignItems: 'center', paddingHorizontal: 32 },
  emptyHeading: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10, textAlign: 'center' },
  emptyBody:    { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },

  loadingText:     { marginTop: 12, fontSize: 14, color: '#6B7280' },
  errorText:       { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  retryButton:     { backgroundColor: '#F3F4F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  retryButtonText: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
