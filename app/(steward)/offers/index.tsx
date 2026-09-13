import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useListAffiliateOffersApiV1AffiliatesOffersGet,
  useSubmitVehicleFunnelInquiryApiV1AffiliatesLeadsVehicleInquiryPost,
  useRecordPopiaConsentApiV1AffiliatesLeadsLeadIdConsentPost,
} from '@/generated/api';
import type { AffiliateOfferOut } from '@/generated/models/affiliateOfferOut';
import { POPIAConsentModal } from '@/components/affiliates/POPIAConsentModal';
import { FICADocumentUploadWizard } from '@/components/affiliates/FICADocumentUploadWizard';

export default function AuxiliaryRevenueHubScreen() {
  const router = useRouter();
  const [selectedVertical, setSelectedVertical] = useState<string>('ALL');

  // Mad Cars Funnel Form State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [salary, setSalary] = useState('');
  const [vehicleType, setVehicleType] = useState('Hatchback');
  const [budgetRange, setBudgetRange] = useState('R3,000 - R5,000 / month');
  const [optInInsurance, setOptInInsurance] = useState(true);
  const [optInTracker, setOptInTracker] = useState(true);
  const [optInDashcam, setOptInDashcam] = useState(true);
  const [optInWarranty, setOptInWarranty] = useState(true);

  // Active Lead & Consent Flow State
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [showPopiaModal, setShowPopiaModal] = useState(false);
  const [popiaRecorded, setPopiaRecorded] = useState(false);

  const { data: offersData, isLoading: offersLoading } =
    useListAffiliateOffersApiV1AffiliatesOffersGet();

  const vehicleInquiryMutation =
    useSubmitVehicleFunnelInquiryApiV1AffiliatesLeadsVehicleInquiryPost();
  const popiaConsentMutation =
    useRecordPopiaConsentApiV1AffiliatesLeadsLeadIdConsentPost();

  const offers: AffiliateOfferOut[] = offersData ?? [];

  const filteredOffers =
    selectedVertical === 'ALL'
      ? offers
      : offers.filter((o) => o.category.toUpperCase() === selectedVertical.toUpperCase());

  const handleShareLink = async (offer: AffiliateOfferOut) => {
    try {
      const shareUrl = offer.affiliate_base_url || 'https://iphande.co.za';
      await Share.share({
        message: `Check out ${offer.name} with iPhande verified benefits: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (err: any) {
      Alert.alert('Sharing Error', err.message);
    }
  };

  const handleStartVehicleInquiry = async () => {
    if (!fullName || !phone || !nationalId || !salary) {
      Alert.alert('Incomplete Form', 'Please fill in all required contact and income fields.');
      return;
    }

    try {
      const result = await vehicleInquiryMutation.mutateAsync({
        data: {
          full_name: fullName,
          phone_number: phone,
          national_id: nationalId,
          monthly_income: parseFloat(salary),
          has_valid_license: true,
          preferred_vehicle_type: vehicleType,
          target_budget_range: budgetRange,
          opt_in_insurance_quote: optInInsurance,
          opt_in_tracker: optInTracker,
          opt_in_dashcam: optInDashcam,
          opt_in_warranty: optInWarranty,
        },
      });

      setActiveLeadId(result.primary_lead.id);
      // Open POPIA consent gate modal
      setShowPopiaModal(true);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to submit vehicle inquiry.';
      Alert.alert('Submission Error', msg);
    }
  };

  const handleConsentRecorded = async (consents: {
    consentedToCreditCheck: boolean;
    consentedToDealershipSharing: boolean;
    consentedToAffiliateForwarding: boolean;
    rawConsentText: string;
  }) => {
    if (!activeLeadId) return;
    try {
      await popiaConsentMutation.mutateAsync({
        leadId: activeLeadId,
        data: {
          id_number: nationalId,
          consented_to_credit_check: consents.consentedToCreditCheck,
          consented_to_dealership_sharing: consents.consentedToDealershipSharing,
          consented_to_affiliate_forwarding: consents.consentedToAffiliateForwarding,
          consent_version: 'POPIA-v1.0-2026',
          raw_consent_text: consents.rawConsentText,
        },
      });

      setShowPopiaModal(false);
      setPopiaRecorded(true);
      Alert.alert(
        'Consent Recorded',
        'POPIA compliance verified. You can now upload your FICA verification documents.'
      );
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to record POPIA consent.';
      Alert.alert('Consent Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Auxiliary Revenue Hub</Text>
          <Text style={styles.headerSubtitle}>
            Monetize distribution with vetted SA commercial partnerships
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dealership Spotlight Banner */}
        <View style={styles.spotlightBanner}>
          <View style={styles.spotlightHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>COMMISSION UP TO R2,925+</Text>
            </View>
            <Ionicons name="car-sport" size={28} color="#0D9488" />
          </View>
          <Text style={styles.spotlightTitle}>Mad Cars Dealership & Auto Cross-Sell</Text>
          <Text style={styles.spotlightDesc}>
            Refer car buyers: earn R200 upfront pre-approval + R2,500 on delivery, with automated
            cross-sell fanout to Car Insurance (R70), Tracker (R50), and Dashcam (R55).
          </Text>
          <TouchableOpacity
            style={styles.spotlightCta}
            onPress={() => setShowVehicleModal(!showVehicleModal)}
          >
            <Text style={styles.spotlightCtaText}>
              {showVehicleModal ? 'Hide Application Form' : 'Start Vehicle Lead & FICA Flow'}
            </Text>
            <Ionicons
              name={showVehicleModal ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Embedded Vehicle Dealership Lead & FICA Flow */}
        {showVehicleModal && (
          <View style={styles.vehicleFormCard}>
            <Text style={styles.formSectionTitle}>Mad Cars Buyer Pre-Approval Form</Text>
            <Text style={styles.formSub}>
              Requires Code B License & minimum R10,000 monthly income.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name (as per ID)"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (e.g. 0821234567)"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="13-Digit SA National ID"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={13}
              value={nationalId}
              onChangeText={setNationalId}
            />
            <TextInput
              style={styles.input}
              placeholder="Gross Monthly Income (ZAR)"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={salary}
              onChangeText={setSalary}
            />

            <Text style={styles.checkboxGroupTitle}>Ancillary Cross-Sell Fanout (Auxiliary Earnings)</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setOptInInsurance(!optInInsurance)}
            >
              <Ionicons
                name={optInInsurance ? 'checkbox' : 'square-outline'}
                size={20}
                color={optInInsurance ? '#0D9488' : '#9CA3AF'}
              />
              <Text style={styles.checkboxLabel}>Car Insurance White-Label Quote (+R70 CPL)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setOptInTracker(!optInTracker)}
            >
              <Ionicons
                name={optInTracker ? 'checkbox' : 'square-outline'}
                size={20}
                color={optInTracker ? '#0D9488' : '#9CA3AF'}
              />
              <Text style={styles.checkboxLabel}>Vehicle GPS Tracking Unit (+R50 CPL)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setOptInDashcam(!optInDashcam)}
            >
              <Ionicons
                name={optInDashcam ? 'checkbox' : 'square-outline'}
                size={20}
                color={optInDashcam ? '#0D9488' : '#9CA3AF'}
              />
              <Text style={styles.checkboxLabel}>Cartrack Telematics Dashcam (+R55 CPL)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setOptInWarranty(!optInWarranty)}
            >
              <Ionicons
                name={optInWarranty ? 'checkbox' : 'square-outline'}
                size={20}
                color={optInWarranty ? '#0D9488' : '#9CA3AF'}
              />
              <Text style={styles.checkboxLabel}>Extended Motor Mechanical Warranty (+R50 CPL)</Text>
            </TouchableOpacity>

            {!activeLeadId ? (
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleStartVehicleInquiry}
                disabled={vehicleInquiryMutation.isPending}
              >
                {vehicleInquiryMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Lead & Proceed to POPIA Gate</Text>
                )}
              </TouchableOpacity>
            ) : popiaRecorded ? (
              <FICADocumentUploadWizard leadId={activeLeadId} />
            ) : (
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => setShowPopiaModal(true)}
              >
                <Text style={styles.submitBtnText}>Complete Statutory POPIA Consent</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContainer}
        >
          {['ALL', 'LOANS', 'FUNERAL', 'DIGITAL_TOOLS', 'WEALTH_AND_SAVINGS', 'VEHICLE'].map(
            (cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  selectedVertical === cat && styles.filterChipActive,
                ]}
                onPress={() => setSelectedVertical(cat)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedVertical === cat && styles.filterChipTextActive,
                  ]}
                >
                  {cat.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {/* Catalog Offers List */}
        <Text style={styles.sectionHeader}>Verified Affiliate Catalog ({filteredOffers.length})</Text>

        {offersLoading ? (
          <ActivityIndicator size="large" color="#0D9488" style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.offersGrid}>
            {filteredOffers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <Text style={styles.offerCategory}>{offer.category.replace(/_/g, ' ')}</Text>
                  <View style={styles.payoutBadge}>
                    <Text style={styles.payoutText}>
                      {offer.payout_percentage
                        ? `${(parseFloat(String(offer.payout_percentage)) * 100).toFixed(0)}% CPS`
                        : `R${offer.base_payout} ${offer.payout_model}`}
                    </Text>
                  </View>
                </View>

                <Text style={styles.offerName}>{offer.name}</Text>
                <Text style={styles.offerClient}>Provider: {offer.client_name}</Text>
                {offer.description && (
                  <Text style={styles.offerDescription}>{offer.description}</Text>
                )}

                <View style={styles.offerMetaRow}>
                  <Text style={styles.splitText}>
                    Merchant Share: {(parseFloat(String(offer.merchant_split_ratio)) * 100).toFixed(0)}%
                  </Text>
                  {offer.requires_fica && (
                    <View style={styles.ficaPill}>
                      <Text style={styles.ficaPillText}>FICA Required</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => handleShareLink(offer)}
                >
                  <Ionicons name="share-social-outline" size={16} color="#0D9488" />
                  <Text style={styles.shareBtnText}>Share Referral Link</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* POPIA Consent Modal */}
      <POPIAConsentModal
        visible={showPopiaModal}
        onClose={() => setShowPopiaModal(false)}
        onConsent={handleConsentRecorded}
        submitting={popiaConsentMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    paddingRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  spotlightBanner: {
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 20,
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
  },
  spotlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#134E4A',
    marginTop: 10,
  },
  spotlightDesc: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 14,
  },
  spotlightCta: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  spotlightCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  vehicleFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  formSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 10,
  },
  checkboxGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  submitBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  filterChipsContainer: {
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  offersGrid: {
    gap: 14,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  payoutBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  payoutText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  offerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  offerClient: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  offerDescription: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginTop: 8,
  },
  offerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  splitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  ficaPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ficaPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
});
