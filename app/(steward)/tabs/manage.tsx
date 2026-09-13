import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/features/auth';

export default function ManageTab() {
  const router = useRouter();
  const { selectedBusiness } = useSession();

  const isVerified = selectedBusiness?.verification_status === 'verified';
  const hasKycNotes = !!selectedBusiness?.kyc_review_notes;
  const isPendingReview = selectedBusiness?.verification_status === 'pending_review';

  const tools = [
    {
      title: 'Quotes & Estimates',
      subtitle: 'Create, send, and manage customer quotes',
      icon: 'document-text-outline',
      color: '#2A9D8F',
      route: '/(steward)/quotes',
    },
    {
      title: 'Business Expenses',
      subtitle: 'Track operational costs and receipts',
      icon: 'receipt-outline',
      color: '#E76F51',
      route: '/(steward)/expenses',
    },
    {
      title: 'Reality Capture',
      subtitle: 'Capture verifiable photo proof of work',
      icon: 'camera-outline',
      color: '#3B82F6',
      route: '/(steward)/reality-capture',
    },
    {
      title: 'Business Setup',
      subtitle: 'Manage profile, category, and location',
      icon: 'business-outline',
      color: '#8B5CF6',
      route: '/(steward)/setup',
    },
    {
      title: 'Payment Verification',
      subtitle: 'Verify customer payments and settlement',
      icon: 'cash-outline',
      color: '#10B981',
      route: '/(steward)/payment-verification',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.heading}>Operations Hub</Text>
          <Text style={styles.subheading}>Manage your service delivery tools</Text>
        </View>

        {/* KYC Compliance Notification Banner */}
        {selectedBusiness && !isVerified && (
          <View
            style={[
              styles.complianceBanner,
              hasKycNotes
                ? styles.complianceBannerNudge
                : isPendingReview
                ? styles.complianceBannerPending
                : styles.complianceBannerAlert,
            ]}
          >
            <View style={styles.complianceHeaderRow}>
              <Ionicons
                name={
                  hasKycNotes
                    ? 'notifications'
                    : isPendingReview
                    ? 'hourglass-outline'
                    : 'alert-circle'
                }
                size={20}
                color={hasKycNotes ? '#0D9488' : isPendingReview ? '#D97706' : '#DC2626'}
              />
              <Text
                style={[
                  styles.complianceTitle,
                  {
                    color: hasKycNotes
                      ? '#0F766E'
                      : isPendingReview
                      ? '#B45309'
                      : '#991B1B',
                  },
                ]}
              >
                {hasKycNotes
                  ? 'Compliance Review Notice'
                  : isPendingReview
                  ? 'FICA Documents Under Review'
                  : 'Payouts Disabled: FICA Required'}
              </Text>
            </View>

            <Text style={styles.complianceBody}>
              {hasKycNotes
                ? `Steward instructions: "${selectedBusiness.kyc_review_notes}"`
                : isPendingReview
                ? 'Your verification documents are being processed by stewards. Turnaround SLA is 24–48 hours.'
                : 'Upload proof of identity and company registration to unlock merchant treasury payouts and automated bank disbursements.'}
            </Text>

            <TouchableOpacity
              style={[
                styles.complianceActionBtn,
                {
                  backgroundColor: hasKycNotes
                    ? '#0D9488'
                    : isPendingReview
                    ? '#D97706'
                    : '#DC2626',
                },
              ]}
              onPress={() => router.push('/(steward)/tabs/profile' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.complianceActionText}>
                {hasKycNotes
                  ? 'Update Documents'
                  : isPendingReview
                  ? 'View FICA Status'
                  : 'Complete Verification'}
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.grid}>
          {tools.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.card}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  heading: { fontSize: 26, fontWeight: '800', color: '#111827' },
  subheading: { fontSize: 15, color: '#6B7280', marginTop: 4 },
  grid: { gap: 14 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  complianceBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  complianceBannerAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  complianceBannerPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  complianceBannerNudge: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  complianceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  complianceTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  complianceBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  complianceActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  complianceActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

