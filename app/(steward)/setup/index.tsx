import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/features/auth';
import { useOnboardStore } from '@/features/business';

// Standard South African Banks & Universal Branch Codes
const SA_BANKS = [
  { name: 'Capitec Bank', branchCode: '470010' },
  { name: 'First National Bank (FNB)', branchCode: '250655' },
  { name: 'Standard Bank', branchCode: '051001' },
  { name: 'Nedbank', branchCode: '198765' },
  { name: 'ABSA Bank', branchCode: '632005' },
  { name: 'TymeBank', branchCode: '678910' },
  { name: 'African Bank', branchCode: '430000' },
  { name: 'Discovery Bank', branchCode: '679000' },
];

const CATEGORIES = [
  'Home & Living (Furniture/Crafts)',
  'Building & Hardware',
  'Fashion & Apparel',
  'Electronics & Solar',
  'Food, Catering & Agro',
  'Carpentry & Woodwork',
  'Plumbing & Electrical',
  'Mechanics & Automotive',
  'Digital & Tech Services',
  'General Trade & Retail',
];

const PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Mpumalanga',
  'Limpopo',
  'Free State',
  'North West',
  'Northern Cape',
];

export default function SetupWizard() {
  const router = useRouter();
  const { identity, selectedBusiness } = useSession();
  const onboardMutation = useOnboardStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Store & Identity
  const [shopName, setShopName] = useState(selectedBusiness?.displayName || '');
  const [slug, setSlug] = useState(selectedBusiness?.slug || '');
  const [businessType, setBusinessType] = useState<'retail' | 'service' | 'wholesale'>('retail');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Step 2: Category & Area
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedProvince, setSelectedProvince] = useState(PROVINCES[0]);
  const [townCity, setTownCity] = useState('Johannesburg');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [shortBio, setShortBio] = useState('');

  // Step 3: Banking (Payouts)
  const [bankName, setBankName] = useState(SA_BANKS[0].name);
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState(SA_BANKS[0].branchCode);
  const [accountType, setAccountType] = useState('Cheque');

  // Step 4: Completed
  const [createdSlug, setCreatedSlug] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-generate slug from shop name
  useEffect(() => {
    if (!isSlugManuallyEdited && shopName.trim()) {
      const generated = shopName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  }, [shopName, isSlugManuallyEdited]);

  const handleBankSelect = (bank: { name: string; branchCode: string }) => {
    setBankName(bank.name);
    setBranchCode(bank.branchCode);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!shopName.trim()) {
        Alert.alert('Shop Name Required', 'Please enter a name for your shop or business.');
        return;
      }
      if (!slug.trim()) {
        Alert.alert('Store Link Required', 'Please choose a link identifier for your store.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!townCity.trim()) {
        Alert.alert('Location Required', 'Please specify your town or city.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!accountNumber.trim()) {
        Alert.alert('Account Number Required', 'Please enter your bank account number to receive payouts.');
        return;
      }
      handleSubmitOnboarding();
    }
  };

  const handleSubmitOnboarding = async () => {
    try {
      const result = await onboardMutation.mutateAsync({
        name: shopName.trim(),
        slug: slug.trim().toLowerCase(),
        business_type: businessType,
        categories: [selectedCategory],
        business_line: selectedCategory,
        short_bio: shortBio.trim() || undefined,
        province: selectedProvince,
        city: townCity.trim(),
        whatsapp_number: whatsappNumber.trim() || undefined,
        bank_name: bankName,
        account_holder_name: accountHolder.trim() || shopName.trim(),
        account_number: accountNumber.trim(),
        branch_code: branchCode.trim(),
        account_type: accountType,
      });

      setCreatedSlug(result.slug);
      setStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not complete store setup.';
      Alert.alert('Setup Error', msg);
    }
  };

  const storeUrl = `https://phanda.app/public/${createdSlug || slug}`;

  const copyStoreLink = async () => {
    await Clipboard.setStringAsync(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello! Check out our smart store and catalog at ${shopName}: ${storeUrl}`
    );
    Linking.openURL(`whatsapp://send?text=${text}`).catch(() => {
      Alert.alert('WhatsApp not installed', `You can copy your link instead: ${storeUrl}`);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header & Step Indicator */}
        <View style={styles.header}>
          <Text style={styles.platformBadge}>iPhande Smart Commerce</Text>
          <Text style={styles.title}>
            {step === 4 ? '🎉 Store Launched!' : 'Launch Your Smart Store'}
          </Text>
          {step < 4 && (
            <View style={styles.progressBar}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={[styles.progressSegment, step >= s && styles.progressSegmentActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── STEP 1: SHOP & SLUG ── */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Name & Store Link</Text>
            <Text style={styles.sectionDesc}>
              This is the link your customers will use to browse and buy from you on WhatsApp and social media.
            </Text>

            <Text style={styles.inputLabel}>Shop or Business Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Soweto Handcrafted Furniture"
              placeholderTextColor="#9ca3af"
              value={shopName}
              onChangeText={setShopName}
            />

            <Text style={styles.inputLabel}>Claim Your Store Link (Slug) *</Text>
            <View style={styles.slugInputContainer}>
              <Text style={styles.slugPrefix}>phanda.app/public/</Text>
              <TextInput
                style={styles.slugInput}
                placeholder="soweto-craft"
                placeholderTextColor="#9ca3af"
                value={slug}
                autoCapitalize="none"
                onChangeText={(val) => {
                  setIsSlugManuallyEdited(true);
                  setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                }}
              />
            </View>

            <View style={styles.linkPreviewBox}>
              <Ionicons name="link-outline" size={18} color="#0D9488" />
              <Text style={styles.linkPreviewText} numberOfLines={1}>
                Live link: phanda.app/public/{slug || 'your-shop'}
              </Text>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>What are you selling?</Text>
            <View style={styles.typeSelectorRow}>
              {[
                { type: 'retail' as const, label: '🛍️ Physical Goods', desc: 'Finished products & stock' },
                { type: 'service' as const, label: '🛠️ Crafts & Work', desc: 'Quotes & custom jobs' },
              ].map((t) => (
                <TouchableOpacity
                  key={t.type}
                  style={[styles.typeCard, businessType === t.type && styles.typeCardActive]}
                  onPress={() => setBusinessType(t.type)}
                >
                  <Text style={[styles.typeTitle, businessType === t.type && styles.typeTitleActive]}>
                    {t.label}
                  </Text>
                  <Text style={styles.typeDesc}>{t.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── STEP 2: CATEGORY & AREA ── */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>2. Trade Category & Operating Area</Text>
            <Text style={styles.sectionDesc}>
              Helps customers discover your shop in their local township or city.
            </Text>

            <Text style={styles.inputLabel}>Primary Business Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Province</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {PROVINCES.map((prov) => (
                <TouchableOpacity
                  key={prov}
                  style={[styles.chip, selectedProvince === prov && styles.chipActive]}
                  onPress={() => setSelectedProvince(prov)}
                >
                  <Text style={[styles.chipText, selectedProvince === prov && styles.chipTextActive]}>
                    {prov}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Town or City *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Soweto, Khayelitsha, Carolina, Pretoria"
              placeholderTextColor="#9ca3af"
              value={townCity}
              onChangeText={setTownCity}
            />

            <Text style={styles.inputLabel}>WhatsApp Business Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 082 123 4567"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={whatsappNumber}
              onChangeText={setWhatsappNumber}
            />

            <Text style={styles.inputLabel}>Short Shop Pitch / Bio (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Tell customers what you specialize in..."
              placeholderTextColor="#9ca3af"
              multiline
              value={shortBio}
              onChangeText={setShortBio}
            />
          </View>
        )}

        {/* ── STEP 3: BANKING DETAILS ── */}
        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>3. Payout Bank Account</Text>
            <Text style={styles.sectionDesc}>
              When customers buy products or pay for services on your store, money is settled directly into this account.
            </Text>

            <Text style={styles.inputLabel}>Select Bank</Text>
            <View style={styles.bankGrid}>
              {SA_BANKS.map((b) => (
                <TouchableOpacity
                  key={b.name}
                  style={[styles.bankCard, bankName === b.name && styles.bankCardActive]}
                  onPress={() => handleBankSelect(b)}
                >
                  <Text style={[styles.bankName, bankName === b.name && styles.bankNameActive]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Account Holder Name *</Text>
            <TextInput
              style={styles.input}
              placeholder={shopName || 'Account Holder'}
              placeholderTextColor="#9ca3af"
              value={accountHolder}
              onChangeText={setAccountHolder}
            />

            <Text style={styles.inputLabel}>Account Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1234567890"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Branch Code</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: '#f1f5f9' }]}
                  value={branchCode}
                  editable={false}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Account Type</Text>
                <View style={styles.typeToggle}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, accountType === 'Cheque' && styles.toggleBtnActive]}
                    onPress={() => setAccountType('Cheque')}
                  >
                    <Text style={[styles.toggleBtnText, accountType === 'Cheque' && styles.toggleBtnTextActive]}>
                      Cheque
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, accountType === 'Savings' && styles.toggleBtnActive]}
                    onPress={() => setAccountType('Savings')}
                  >
                    <Text style={[styles.toggleBtnText, accountType === 'Savings' && styles.toggleBtnTextActive]}>
                      Savings
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── STEP 4: SUCCESS & SHARE ── */}
        {step === 4 && (
          <View style={[styles.card, styles.successCard]}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={40} color="#0D9488" />
            </View>

            <Text style={styles.successTitle}>Your Smart Store is Live!</Text>
            <Text style={styles.successSubtitle}>
              Customers can now visit your link, add your products to cart, and book your services.
            </Text>

            <View style={styles.storeLinkCard}>
              <Text style={styles.storeLinkPill}>PUBLIC STORE LINK</Text>
              <Text style={styles.storeLinkUrl}>{storeUrl}</Text>

              <View style={styles.shareActionRow}>
                <TouchableOpacity style={styles.copyBtn} onPress={copyStoreLink}>
                  <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="#0D9488" />
                  <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Link'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.whatsappBtn} onPress={shareViaWhatsApp}>
                  <Ionicons name="logo-whatsapp" size={18} color="#ffffff" />
                  <Text style={styles.whatsappBtnText}>Share on WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.nextStepsCard}>
              <Text style={styles.nextStepsTitle}>Next: Add Your First Product or Service</Text>
              <Text style={styles.nextStepsDesc}>
                Snap a picture of an item in your workshop or describe a service you offer so customers can start buying immediately.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.replace('/(steward)/opportunities/new')}
            >
              <Text style={styles.primaryBtnText}>+ Add My First Item / Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace('/(steward)/dashboard')}
            >
              <Text style={styles.secondaryBtnText}>Go to Merchant Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons for Steps 1 - 3 */}
        {step < 4 && (
          <View style={styles.footerActions}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep((s) => (s - 1) as any)}
                disabled={onboardMutation.isPending}
              >
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1 }]}
              onPress={handleNext}
              disabled={onboardMutation.isPending}
            >
              {onboardMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {step === 3 ? 'Launch Store & Save Payouts' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  platformBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  progressBar: { flexDirection: 'row', gap: 6, height: 4, marginTop: 4 },
  progressSegment: { flex: 1, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 },
  progressSegmentActive: { backgroundColor: '#0D9488' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 18 },

  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 14,
  },
  slugInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  slugPrefix: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  slugInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  linkPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 10,
    borderRadius: 10,
    gap: 6,
    marginBottom: 12,
  },
  linkPreviewText: { fontSize: 12, color: '#0D9488', fontWeight: '600', flex: 1 },

  typeSelectorRow: { flexDirection: 'row', gap: 10 },
  typeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  typeCardActive: { borderColor: '#0D9488', backgroundColor: '#F0FDFA' },
  typeTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 2 },
  typeTitleActive: { color: '#0D9488' },
  typeDesc: { fontSize: 11, color: '#64748B' },

  categoryScroll: { flexDirection: 'row', marginBottom: 14 },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#0D9488' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },

  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  bankCard: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  bankCardActive: { borderColor: '#0D9488', backgroundColor: '#F0FDFA' },
  bankName: { fontSize: 12, fontWeight: '600', color: '#334155' },
  bankNameActive: { color: '#0D9488' },

  row: { flexDirection: 'row', alignItems: 'center' },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2,
    height: 46,
  },
  toggleBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  toggleBtnTextActive: { color: '#0D9488', fontWeight: '700' },

  footerActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  primaryBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtnText: { color: '#475569', fontSize: 14, fontWeight: '600' },

  // Success Step Styles
  successCard: { alignItems: 'center', textAlign: 'center', paddingVertical: 28 },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  storeLinkCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  storeLinkPill: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 6,
  },
  storeLinkUrl: { fontSize: 16, fontWeight: '800', color: '#0D9488', marginBottom: 14 },
  shareActionRow: { flexDirection: 'row', gap: 10, width: '100%' },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0D9488',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  copyBtnText: { fontSize: 13, fontWeight: '700', color: '#0D9488' },
  whatsappBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  whatsappBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  nextStepsCard: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  nextStepsTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  nextStepsDesc: { fontSize: 12, color: '#64748B', lineHeight: 16 },
});
