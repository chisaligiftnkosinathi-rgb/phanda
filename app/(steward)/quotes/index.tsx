import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSession } from '@/features/auth';
import { useBusinessQuotes } from '@/features/quote';
import type { QuoteStatus } from '@/features/quote';

export default function QuotesScreen() {
  const router = useRouter();
  const { selectedBusiness } = useSession();
  const { data: quotes, isLoading, isRefetching, refetch } = useBusinessQuotes(selectedBusiness?.id ?? '');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Proposals</Text>
        <Text style={styles.title}>Your Quotes</Text>
        <Text style={styles.subtitle}>Manage draft and sent quotes.</Text>
      </View>

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#111827" style={{ marginTop: 40 }} />
        ) : !quotes || quotes.length === 0 ? (
          <Text style={styles.emptyText}>No quotes generated yet.</Text>
        ) : (
          quotes.map((quote) => (
            <TouchableOpacity
              key={quote.id}
              style={styles.card}
              onPress={() => router.push(`/quotes/${quote.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.quoteId}>IPH-{quote.id.split('-')[0].toUpperCase()}</Text>
                <StatusBadge status={quote.statusLabel} />
              </View>
              <Text style={styles.customerName}>{quote.customerName}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.amountText}>{quote.amountDisplay}</Text>
                <Text style={styles.dateText}>{new Date(quote.createdAt).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: QuoteStatus }) {
  const config: Record<QuoteStatus, { bg: string; text: string }> = {
    Draft:     { bg: '#F3F4F6', text: '#4B5563' },
    Reviewed:  { bg: '#FEF3C7', text: '#92400E' },
    Sent:      { bg: '#DBEAFE', text: '#1E40AF' },
    Accepted:  { bg: '#D1FAE5', text: '#065F46' },
    Declined:  { bg: '#FEE2E2', text: '#991B1B' },
    Expired:   { bg: '#F3F4F6', text: '#9CA3AF' },
    Converted: { bg: '#EDE9FE', text: '#5B21B6' },
  };
  const { bg, text } = config[status] ?? config.Draft;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 24, paddingTop: 48, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  kicker: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#6B7280' },
  listContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  listContent: { padding: 24, gap: 16 },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  quoteId: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 16 },
  badgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  customerName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 16, marginTop: 12 },
  amountText: { fontSize: 18, fontWeight: '800', color: '#111827' },
  dateText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
});
