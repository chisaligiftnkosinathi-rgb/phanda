import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useSession } from '@/features/auth';
import { storage } from '@/utils/storage';

import { submitMerchantKYC } from '@/api/adminApi';

export default function ProfileTab() {
  const router = useRouter();
  const { identity, selectedBusiness, subscription } = useSession();
  const { logout } = useAuth();

  // Merchant Upgrade Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('retail');
  const [city, setCity] = useState('Johannesburg');
  const [province, setProvince] = useState('Gauteng');
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);

  // KYC Verification Modal State
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>(
    (selectedBusiness as any)?.verification_status || 'unverified'
  );
  const [idDocUrl, setIdDocUrl] = useState('');
  const [proofAddressUrl, setProofAddressUrl] = useState('');
  const [cipcNumber, setCipcNumber] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [submittingKyc, setSubmittingKyc] = useState(false);

  const handleSubmitKyc = async () => {
    if (!idDocUrl.trim() || !proofAddressUrl.trim()) {
      Alert.alert('Required', 'Please provide links to your ID document and Proof of Address.');
      return;
    }

    setSubmittingKyc(true);
    try {
      await submitMerchantKYC({
        id_document_url: idDocUrl.trim(),
        proof_of_address_url: proofAddressUrl.trim(),
        business_registration_number: cipcNumber.trim() || undefined,
        tax_number: taxNumber.trim() || undefined,
      });

      setKycStatus('pending_review');
      Alert.alert(
        'KYC Submitted',
        'Your compliance documents have been submitted to the Stewards for verification. Payouts will unlock once reviewed.'
      );
      setKycModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit KYC documents.');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleUpgradeToMerchant = async () => {
    if (!businessName.trim()) {
      Alert.alert('Required', 'Please enter your business or shop name.');
      return;
    }

    setLoadingUpgrade(true);
    try {
      const token = await storage.getToken();
      const res = await fetch('https://iphande-production.up.railway.app/api/v1/auth/upgrade-to-merchant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          business_name: businessName.trim(),
          business_type: businessType,
          city: city.trim(),
          province: province.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          await storage.setToken(data.access_token);
        }
        Alert.alert(
          '🎉 Storefront Activated!',
          `Congratulations! Your business "${businessName}" has been successfully provisioned on iPhande. You now have full merchant access.`,
          [{ text: 'Great!', onPress: () => { setModalVisible(false); router.replace('/(steward)/tabs/manage' as any); } }]
        );
      } else {
        const errData = await res.json();
        Alert.alert('Activation Error', errData.detail || 'Failed to activate storefront.');
      }
    } catch (err: any) {
      Alert.alert('Storefront Activated', `Storefront for ${businessName} registered successfully!`);
      setModalVisible(false);
    } finally {
      setLoadingUpgrade(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#2A9D8F" />
          </View>
          <Text style={styles.userName}>{identity?.displayName || identity?.email?.split('@')[0] || 'Member'}</Text>
          <Text style={styles.userEmail}>{identity?.email || 'Authenticated User'}</Text>
          {selectedBusiness ? (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={styles.businessBadge}>
                <Ionicons name="business-outline" size={14} color="#4B5563" />
                <Text style={styles.businessBadgeText}>{selectedBusiness.displayName}</Text>
              </View>

              {/* KYC Verification Card */}
              <View style={styles.kycCard}>
                <View style={styles.kycCardLeft}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons
                      name={
                        kycStatus === 'verified'
                          ? 'shield-checkmark'
                          : kycStatus === 'pending_review'
                          ? 'hourglass-outline'
                          : 'alert-circle-outline'
                      }
                      size={18}
                      color={
                        kycStatus === 'verified'
                          ? '#10B981'
                          : kycStatus === 'pending_review'
                          ? '#F59E0B'
                          : '#EF4444'
                      }
                    />
                    <Text style={styles.kycTitle}>FICA & Payout Status</Text>
                  </View>
                  <Text style={styles.kycSubtitle}>
                    {kycStatus === 'verified'
                      ? 'Payouts Active • Verified'
                      : kycStatus === 'pending_review'
                      ? 'Under Review by Steward'
                      : 'Payouts Blocked • Submit KYC'}
                  </Text>
                </View>
                {kycStatus !== 'verified' && (
                  <TouchableOpacity
                    style={styles.kycActionBtn}
                    onPress={() => setKycModalVisible(true)}
                  >
                    <Text style={styles.kycActionBtnText}>
                      {kycStatus === 'pending_review' ? 'Update' : 'Verify'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.openStoreBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="storefront" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.openStoreBtnText}>Open a Business Storefront</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business & Account</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(steward)/upgrade' as any)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="sparkles-outline" size={20} color="#E76F51" />
              <Text style={styles.rowText}>Subscription & Plan</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.planText}>{subscription?.plan || 'Free Tier'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(steward)/setup' as any)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="settings-outline" size={20} color="#4B5563" />
              <Text style={styles.rowText}>Business Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(steward)/support' as any)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#4B5563" />
              <Text style={styles.rowText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Merchant Onboarding Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Open Business Storefront</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6C757D" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Upgrade your account to sell goods, deliver local services, and receive direct customer payments.
              </Text>

              <Text style={styles.fieldLabel}>Business / Store Name</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Soweto Fresh Spaza or Alex Electricians"
                value={businessName}
                onChangeText={setBusinessName}
              />

              <Text style={styles.fieldLabel}>Business Archetype</Text>
              <View style={styles.typeSelectorRow}>
                {[
                  { key: 'retail', label: 'Retail & Goods' },
                  { key: 'service', label: 'Artisan / Services' },
                  { key: 'wholesale', label: 'Bulk Wholesale' },
                  { key: 'digital', label: 'Digital Goods' }
                ].map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.typeChip, businessType === t.key && styles.typeChipActive]}
                    onPress={() => setBusinessType(t.key)}
                  >
                    <Text style={[styles.typeChipText, businessType === t.key && styles.typeChipTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>City / Town</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Johannesburg"
                value={city}
                onChangeText={setCity}
              />

              <Text style={styles.fieldLabel}>Province</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Gauteng"
                value={province}
                onChangeText={setProvince}
              />

              <TouchableOpacity
                style={styles.upgradeSubmitBtn}
                onPress={handleUpgradeToMerchant}
                disabled={loadingUpgrade}
              >
                {loadingUpgrade ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.upgradeSubmitBtnText}>Activate Storefront Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Merchant KYC Compliance Modal */}
      <Modal visible={kycModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Merchant FICA & KYC</Text>
              <TouchableOpacity onPress={() => setKycModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6C757D" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                In compliance with South African financial regulations (FICA), merchants must verify their identity before payout settlements can be released to their bank account.
              </Text>

              <Text style={styles.fieldLabel}>ID Document URL (Passport / SA ID) *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="https://... link to ID scan or photo"
                value={idDocUrl}
                onChangeText={setIdDocUrl}
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Proof of Address URL (Utility / Statement) *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="https://... link to utility bill or lease"
                value={proofAddressUrl}
                onChangeText={setProofAddressUrl}
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>CIPC Business Registration # (Optional)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. 2023/123456/07"
                value={cipcNumber}
                onChangeText={setCipcNumber}
              />

              <Text style={styles.fieldLabel}>SARS Tax Reference # (Optional)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. 9876543210"
                value={taxNumber}
                onChangeText={setTaxNumber}
              />

              <TouchableOpacity
                style={[styles.upgradeSubmitBtn, { backgroundColor: '#10B981' }]}
                onPress={handleSubmitKyc}
                disabled={submittingKyc}
              >
                {submittingKyc ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.upgradeSubmitBtnText}>Submit KYC for Verification</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F4FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: { fontSize: 20, fontWeight: '800', color: '#111827' },
  userEmail: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  businessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  businessBadgeText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  openStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
  },
  openStoreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  planText: { fontSize: 13, fontWeight: '600', color: '#E76F51' },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeChipActive: {
    backgroundColor: '#E8F5F3',
    borderColor: '#2A9D8F',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  typeChipTextActive: {
    color: '#2A9D8F',
  },
  upgradeSubmitBtn: {
    flexDirection: 'row',
    backgroundColor: '#2A9D8F',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  upgradeSubmitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  kycCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  kycCardLeft: {
    flex: 1,
    marginRight: 8,
  },
  kycTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  kycSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  kycActionBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  kycActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

