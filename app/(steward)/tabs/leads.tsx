import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLeadInbox } from '@/features/lead';
import { StatusBadge, LoadingView, EmptyState, ScreenError } from '@/components/ui/DomainPrimitives';
import type { LeadCardViewModel } from '@/features/lead';

export default function LeadsScreen() {
  const router = useRouter();
  const { data: leads, isLoading, isError, refetch } = useLeadInbox();

  const unreadCount = (leads ?? []).filter((l) => l.isNew).length;

  const handleOpen = (id: string) =>
    router.push({ pathname: '/(steward)/leads/[id]' as any, params: { id } });

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Lead Inbox</Text>
          <Text style={styles.subheading}>
            {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ScreenError message="Could not load leads." onRetry={() => refetch()} />
      ) : (
        <FlatList<LeadCardViewModel>
          data={leads ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              heading="No leads yet"
              body="When visitors express interest in your opportunities, their leads will appear here."
            />
          }
          renderItem={({ item }) => (
            <LeadCard item={item} onPress={() => handleOpen(item.id)} />
          )}
        />
      )}
    </View>
  );
}

// ─── LEAD CARD ───────────────────────────────────────────────────────────────

function LeadCard({ item, onPress }: { item: LeadCardViewModel; onPress: () => void }) {
  const date = new Date(item.receivedAt).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[styles.card, item.isNew && styles.cardNew]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {item.isNew && <View style={styles.newDot} />}
      <View style={styles.cardContent}>
        <View style={styles.cardMain}>
          <Text style={styles.cardName}>{item.contactName}</Text>
          <Text style={styles.cardService} numberOfLines={1}>{item.serviceNeeded}</Text>
          <Text style={styles.cardDate}>{date}</Text>
        </View>
        <StatusBadge status={item.statusLabel} />
      </View>
    </TouchableOpacity>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  heading:    { fontSize: 26, fontWeight: '800', color: '#111827' },
  subheading: { fontSize: 14, color: '#6B7280', marginTop: 2 },

  badge: {
    backgroundColor: '#EF4444', width: 32, height: 32,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

  list:      { padding: 16 },
  separator: { height: 8 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  cardNew:     { borderColor: '#BFDBFE', borderWidth: 1.5 },
  newDot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB',
  },
  cardContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardMain:    { flex: 1 },
  cardName:    { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardService: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  cardDate:    { fontSize: 12, color: '#9CA3AF' },
});
