import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface POPIAConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onConsent: (consents: {
    consentedToCreditCheck: boolean;
    consentedToDealershipSharing: boolean;
    consentedToAffiliateForwarding: boolean;
    rawConsentText: string;
  }) => void;
  submitting?: boolean;
}

export const POPIA_STANDARD_TEXT =
  'In terms of the Protection of Personal Information Act 4 of 2013 (POPIA), I explicitly grant informed, voluntary consent to iPhande, registered credit reference bureaus, and vetted commercial partners (including Mad Cars Dealership and accredited finance providers) to process, verify, and store my personal and financial information solely for the purposes of evaluating creditworthiness, financing pre-approval, and vehicle procurement.';

export function POPIAConsentModal({
  visible,
  onClose,
  onConsent,
  submitting = false,
}: POPIAConsentModalProps) {
  const [creditCheck, setCreditCheck] = useState(true);
  const [dealershipSharing, setDealershipSharing] = useState(true);
  const [affiliateForwarding, setAffiliateForwarding] = useState(true);

  const canProceed = creditCheck && dealershipSharing;

  const handleConfirm = () => {
    if (!canProceed) return;
    onConsent({
      consentedToCreditCheck: creditCheck,
      consentedToDealershipSharing: dealershipSharing,
      consentedToAffiliateForwarding: affiliateForwarding,
      rawConsentText: POPIA_STANDARD_TEXT,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="shield-checkmark" size={24} color="#0D9488" />
              <Text style={styles.title}>POPIA Statutory Consent</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={submitting} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.notice}>
              South African law (POPIA Act 4 of 2013) requires your explicit, voluntary consent before your financial details or documents can be checked for vehicle financing or credit pre-approval.
            </Text>

            <View style={styles.disclosureBox}>
              <Text style={styles.disclosureText}>{POPIA_STANDARD_TEXT}</Text>
            </View>

            <Text style={styles.sectionHeader}>Granular Statutory Permissions</Text>

            <TouchableOpacity
              style={styles.checkItem}
              onPress={() => setCreditCheck(!creditCheck)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={creditCheck ? 'checkbox' : 'square-outline'}
                size={22}
                color={creditCheck ? '#0D9488' : '#9CA3AF'}
              />
              <View style={styles.checkTextContainer}>
                <Text style={styles.checkLabel}>Credit Bureau Assessment (Required)</Text>
                <Text style={styles.checkDescription}>
                  Allows checking affordability & credit records with accredited SA bureaus.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkItem}
              onPress={() => setDealershipSharing(!dealershipSharing)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={dealershipSharing ? 'checkbox' : 'square-outline'}
                size={22}
                color={dealershipSharing ? '#0D9488' : '#9CA3AF'}
              />
              <View style={styles.checkTextContainer}>
                <Text style={styles.checkLabel}>Dealership Sharing (Required)</Text>
                <Text style={styles.checkDescription}>
                  Allows transmitting application details directly to Mad Cars finance managers.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkItem}
              onPress={() => setAffiliateForwarding(!affiliateForwarding)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={affiliateForwarding ? 'checkbox' : 'square-outline'}
                size={22}
                color={affiliateForwarding ? '#0D9488' : '#9CA3AF'}
              />
              <View style={styles.checkTextContainer}>
                <Text style={styles.checkLabel}>Ancillary Quotes (Recommended)</Text>
                <Text style={styles.checkDescription}>
                  Opt-in for instant comparative quotes on telematics, trackers, and car insurance.
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn, (!canProceed || submitting) && styles.confirmBtnDisabled]}
              disabled={!canProceed || submitting}
              onPress={handleConfirm}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Accept & Authorize Documents</Text>
              )}
            </TouchableOpacity>
            {!canProceed && (
              <Text style={styles.errorHint}>
                * Credit Check & Dealership sharing are mandatory under FICA/POPIA.
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  notice: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 14,
  },
  disclosureBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  disclosureText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  checkTextContainer: {
    flex: 1,
  },
  checkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  checkDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  confirmBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  errorHint: {
    color: '#DC2626',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
});
