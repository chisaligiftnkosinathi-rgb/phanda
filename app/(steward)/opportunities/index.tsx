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
import { useSession } from '@/features/auth';

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
  const { selectedBusiness } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  const { data: opportunities, isLoading, isError, refetch } = useBusinessOpportunities(activeTab.filter);

  const handleNew = () => router.push('/(steward)/opportunities/new');
  const handleOpen = (slug: string) => router.push(`/(steward)/opportunities/${slug}`);
  const handleViewStore = () => {
    if (selectedBusiness?.slug) {
      router.push(`/(public)/public/${selectedBusiness.slug}`);
    }
  };

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Catalog & Store</Text>
          <Text style={styles.subheading}>Products, services & public inventory</Text>
        </View>

        <View style={styles.headerActions}>
          {selectedBusiness?.slug ? (
            <TouchableOpacity
              style={styles.storeButton}
              onPress={handleViewStore}
              accessibilityLabel="View public storefront"
            >
              <Text style={styles.storeButtonText}>Store ↗</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.newButton}
            onPress={handleNew}
            accessibilityLabel="Post new opportunity"
          >
            <Text style={styles.newButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>
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
          ListEmptyComponent={
            <EmptyState
              heading="No catalog items yet"
              body="Add physical products to sell or craftsman services for dignity quotes."
              cta="Add Product or Service"
              onCta={handleNew}
            />
          }
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
  const isPhysical = item.productType === 'physical';
  const isDigital = item.productType === 'digital';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardRow}>
        <View style={styles.cardMain}>
          {/* Product Type Tag */}
          <View style={styles.tagRow}>
            <View
              style={[
                styles.typeTag,
                isPhysical
                  ? styles.typeTagPhysical
                  : isDigital
                  ? styles.typeTagDigital
                  : styles.typeTagService,
              ]}
            >
              <Text
                style={[
                  styles.typeTagText,
                  isPhysical
                    ? styles.typeTagPhysicalText
                    : isDigital
                    ? styles.typeTagDigitalText
                    : styles.typeTagServiceText,
                ]}
              >
                {isPhysical
                  ? '🛍️ Physical Product'
                  : isDigital
                  ? '💾 Digital Good'
                  : '🛠️ Craftsman Service'}
              </Text>
            </View>

            {item.sku ? <Text style={styles.skuText}>SKU: {item.sku}</Text> : null}
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.cardPrice}>{item.priceDisplay}</Text>

            {isPhysical ? (
              <View style={styles.stockBox}>
                <Text
                  style={[
                    styles.stockText,
                    item.stockQuantity !== undefined && item.stockQuantity <= 0 && styles.stockTextOut,
                  ]}
                >
                  {item.stockQuantity !== undefined
                    ? item.stockQuantity > 0
                      ? `📦 ${item.stockQuantity} in stock`
                      : '⚠️ Out of stock'
                    : '📦 In stock'}
                </Text>
              </View>
            ) : (
              <Text style={styles.cardMeta}>{item.isRemote ? 'Remote' : 'On-site'}</Text>
            )}
          </View>
        </View>

        <StatusBadge status={item.state} />
      </View>
    </TouchableOpacity>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  heading: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subheading: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  storeButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeButtonText: { color: '#111827', fontWeight: '700', fontSize: 13 },
  newButton: {
    backgroundColor: '#1B4332',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  newButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 4,
  },
  tabActive: { borderBottomColor: '#1B4332' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#1B4332', fontWeight: '700' },

  list: { padding: 16 },
  separator: { height: 10 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardMain: { flex: 1 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeTagText: { fontSize: 11, fontWeight: '700' },
  typeTagPhysical: { backgroundColor: '#E8F5E9' },
  typeTagPhysicalText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },
  typeTagDigital: { backgroundColor: '#EDE9FE' },
  typeTagDigitalText: { color: '#6D28D9', fontSize: 11, fontWeight: '700' },
  typeTagService: { backgroundColor: '#FEF3C7' },
  typeTagServiceText: { color: '#D97706', fontSize: 11, fontWeight: '700' },
  skuText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },

  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  cardPrice: { fontSize: 15, fontWeight: '800', color: '#111827' },
  stockBox: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  stockText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  stockTextOut: { color: '#DC2626' },
  cardMeta: { fontSize: 13, color: '#6B7280' },
});
