import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOpportunityDetail } from '@/features/opportunity';

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: opportunity, isLoading, isError } = useOpportunityDetail(id ?? '');

  const handleCreateQuote = () => {
    router.push({ pathname: '/quotes/new', params: { opportunity_id: id } });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (isError || !opportunity) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Could not load opportunity.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Opportunity</Text>
        <Text style={styles.title}>{opportunity.title}</Text>
        <View style={[styles.badge, getStateBadgeStyle(opportunity.state)]}>
          <Text style={[styles.badgeText, getStateLabelStyle(opportunity.state)]}>
            {opportunity.state.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Details</Text>
          <Text style={styles.primaryText}>{opportunity.description || '—'}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Location</Text>
          <Text style={styles.primaryText}>{opportunity.locationDisplay}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Budget / Rate</Text>
          <Text style={styles.primaryText}>{opportunity.priceDisplay}</Text>

          {opportunity.requirements.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionHeading}>Requirements</Text>
              {opportunity.requirements.map((r, i) => (
                <Text key={i} style={styles.primaryText}>• {r}</Text>
              ))}
            </>
          )}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateQuote}>
            <Text style={styles.primaryButtonText}>Create Quote for Opportunity</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── STATE BADGE HELPERS ──────────────────────────────────────────────────────

function getStateBadgeStyle(state: string) {
  switch (state) {
    case 'Published':
    case 'Visible':
    case 'Receiving Leads': return styles.badgePublished;
    case 'Draft':           return styles.badgeDraft;
    case 'Archived':        return styles.badgeArchived;
    default:                return styles.badgeActive;
  }
}

function getStateLabelStyle(state: string) {
  switch (state) {
    case 'Published':
    case 'Visible':
    case 'Receiving Leads': return styles.badgeTextPublished;
    case 'Draft':           return styles.badgeTextDraft;
    case 'Archived':        return styles.badgeTextArchived;
    default:                return styles.badgeTextActive;
  }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { justifyContent: 'center', alignItems: 'center' },

  header: {
    padding: 24, paddingTop: 48, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'flex-start',
  },
  kicker: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 4 },
  title:  { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 10 },

  badge:              { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, marginTop: 4 },
  badgePublished:     { backgroundColor: '#DCFCE7' },
  badgeDraft:         { backgroundColor: '#F3F4F6' },
  badgeArchived:      { backgroundColor: '#FEF2F2' },
  badgeActive:        { backgroundColor: '#DBEAFE' },

  badgeText:          { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  badgeTextPublished: { color: '#166534' },
  badgeTextDraft:     { color: '#374151' },
  badgeTextArchived:  { color: '#991B1B' },
  badgeTextActive:    { color: '#1E40AF' },

  content: { padding: 24 },
  card: {
    backgroundColor: '#FFFFFF', padding: 24, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 13, fontWeight: '700', color: '#6B7280',
    textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5,
  },
  primaryText: { fontSize: 18, fontWeight: '500', color: '#111827', marginBottom: 4 },
  divider:     { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },

  actionSection: { gap: 12 },
  primaryButton: {
    backgroundColor: '#111827', paddingVertical: 16,
    borderRadius: 12, alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },

  errorText:       { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  backButton:      { backgroundColor: '#F3F4F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  backButtonText:  { fontSize: 14, fontWeight: '600', color: '#111827' },
});
