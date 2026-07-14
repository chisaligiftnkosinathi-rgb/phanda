import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOpportunityDetail } from '@/features/opportunity';

export default function PublicOpportunityDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: opportunity, isLoading, isError } = useOpportunityDetail(slug ?? '');

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (isError || !opportunity) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>This opportunity could not be loaded.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back to feed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ── Hero ── */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Opportunities</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{opportunity.title}</Text>
        <View style={styles.heroMeta}>
          <MetaPill label={opportunity.isRemote ? '🌐 Remote' : '📍 On-site'} />
          <MetaPill label={opportunity.priceDisplay} strong />
        </View>
      </View>

      {/* ── Details ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About this opportunity</Text>
        <Text style={styles.body}>{opportunity.description || 'No description provided.'}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Location</Text>
        <Text style={styles.body}>{opportunity.locationDisplay}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Budget / Rate</Text>
        <Text style={styles.priceDisplay}>{opportunity.priceDisplay}</Text>
        <Text style={styles.pricingType}>{opportunity.pricingType} pricing</Text>
      </View>

      {opportunity.requirements.length > 0 && (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Requirements</Text>
            {opportunity.requirements.map((r, i) => (
              <View key={i} style={styles.requirementRow}>
                <Text style={styles.requirementDot}>•</Text>
                <Text style={styles.requirementText}>{r}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ── Call To Action ── */}
      <View style={styles.ctaBlock}>
        <Text style={styles.ctaHeading}>Interested in this opportunity?</Text>
        <Text style={styles.ctaBody}>
          Submit a lead and the business will be in touch with you directly.
        </Text>
        {/* Lead submission will be wired in Phase B */}
        <TouchableOpacity
          style={styles.ctaButton}
          accessibilityLabel="Express interest in this opportunity"
          onPress={() => {
            router.push({ pathname: '/(public)/leads' as any, params: { slug } });
          }}
        >
          <Text style={styles.ctaButtonText}>Express Interest</Text>
        </TouchableOpacity>
        <Text style={styles.ctaNote}>Lead Engine — coming in Phase B</Text>
      </View>
    </ScrollView>
  );
}

// ─── META PILL ───────────────────────────────────────────────────────────────

function MetaPill({ label, strong }: { label: string; strong?: boolean }) {
  return (
    <View style={[styles.pill, strong && styles.pillStrong]}>
      <Text style={[styles.pillText, strong && styles.pillTextStrong]}>{label}</Text>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#F9FAFB' },
  centered:{ justifyContent: 'center', alignItems: 'center', padding: 32 },
  content: { paddingBottom: 60 },

  hero: {
    backgroundColor: '#111827', padding: 24, paddingTop: 52, paddingBottom: 28,
  },
  backRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 6 },
  backArrow:{ fontSize: 18, color: '#9CA3AF' },
  backLabel:{ fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  title:    { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 16, lineHeight: 32 },
  heroMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

  pill:          { backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  pillStrong:    { backgroundColor: '#FFFFFF' },
  pillText:      { fontSize: 13, color: '#FFFFFF', fontWeight: '500' },
  pillTextStrong:{ color: '#111827', fontWeight: '700' },

  section: { paddingHorizontal: 24, paddingVertical: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  body: { fontSize: 16, color: '#374151', lineHeight: 24 },

  priceDisplay: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  pricingType:  { fontSize: 13, color: '#6B7280', textTransform: 'capitalize' },

  requirementRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  requirementDot: { fontSize: 16, color: '#9CA3AF' },
  requirementText:{ fontSize: 15, color: '#374151', flex: 1 },

  divider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 24 },

  ctaBlock: {
    margin: 24, padding: 24, backgroundColor: '#FFFFFF',
    borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  ctaHeading: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  ctaBody:    { fontSize: 15, color: '#6B7280', lineHeight: 22, marginBottom: 20 },
  ctaButton:  {
    backgroundColor: '#111827', paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    marginBottom: 10,
  },
  ctaButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  ctaNote:       { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },

  errorText:       { fontSize: 16, color: '#6B7280', marginBottom: 16, textAlign: 'center' },
  backButton:      { backgroundColor: '#F3F4F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  backButtonText:  { fontSize: 14, fontWeight: '600', color: '#111827' },
});
