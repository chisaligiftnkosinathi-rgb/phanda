import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/features/auth';
import {
    approvePayment,
    getPaymentProofs,
    PaymentReview,
    rejectPayment,
    getMerchantKYCQueue,
    reviewMerchantKYC,
    nudgeMerchantKYC,
    triggerComplianceEscalations,
    MerchantKYCItem
} from '@/api/adminApi';
import { theme } from '@/config/theme';
import { PageHeader } from '@/components/PageHeader';

export default function AdminPaymentProofsScreen() {
    const router = useRouter();
    const { platformRole, loading: isLoadingProfile } = useSession();
    const [activeTab, setActiveTab] = useState<'proofs' | 'kyc'>('proofs');
    const [proofs, setProofs] = useState<PaymentReview[]>([]);
    const [kycQueue, setKycQueue] = useState<MerchantKYCItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Reject Modal State
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);

    // Nudge Modal State
    const [nudgeModalVisible, setNudgeModalVisible] = useState(false);
    const [nudgeMessage, setNudgeMessage] = useState('');
    const [nudgeMerchantId, setNudgeMerchantId] = useState<string | null>(null);
    const [nudgeMerchantName, setNudgeMerchantName] = useState<string>('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [proofsData, kycData] = await Promise.all([
                getPaymentProofs('pending_review').catch(() => []),
                getMerchantKYCQueue(undefined, true).catch(() => [])
            ]);
            setProofs(proofsData);
            setKycQueue(kycData);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load pending queue';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoadingProfile && platformRole !== 'admin' && platformRole !== 'owner' && platformRole !== 'supaadmin') {
            Alert.alert('Access Denied', 'You do not have permission to view this page.');
            router.replace('/tabs/home' as const);
            return;
        }

        if (platformRole === 'admin' || platformRole === 'owner' || platformRole === 'supaadmin') {
            loadData();
        }
    }, [platformRole, isLoadingProfile, loadData]);

    const handleApprove = async (profileId: string) => {
        Alert.alert(
            "Approve Profile",
            "Are you sure you want to approve this setup fee and activate the profile?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    style: "default",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await approvePayment(profileId);
                            Alert.alert("Success", "Profile activated.");
                            await loadData();
                        } catch (err: unknown) {
                            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to approve');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleApproveKYC = async (merchantId: string) => {
        Alert.alert(
            "Approve Merchant KYC",
            "Are you sure you want to approve this merchant's compliance documents? This will enable automated payout disbursements.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve KYC",
                    style: "default",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await reviewMerchantKYC(merchantId, 'approve');
                            Alert.alert("Success", "Merchant KYC verified. Payouts enabled.");
                            await loadData();
                        } catch (err: unknown) {
                            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to approve KYC');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openRejectModal = (profileId: string) => {
        setSelectedProfileId(profileId);
        setSelectedMerchantId(null);
        setRejectNote('');
        setRejectModalVisible(true);
    };

    const openRejectKycModal = (merchantId: string) => {
        setSelectedMerchantId(merchantId);
        setSelectedProfileId(null);
        setRejectNote('');
        setRejectModalVisible(true);
    };

    const openNudgeModal = (merchantId: string, merchantName: string) => {
        setNudgeMerchantId(merchantId);
        setNudgeMerchantName(merchantName);
        setNudgeMessage("Please upload clear, legible copies of your ID and proof of address so we can approve your account for payouts.");
        setNudgeModalVisible(true);
    };

    const handleSendNudge = async () => {
        if (!nudgeMerchantId) return;
        setActionLoading(true);
        try {
            await nudgeMerchantKYC(nudgeMerchantId, nudgeMessage.trim());
            Alert.alert("Compliance Nudge Sent", `Notification dispatched to ${nudgeMerchantName}.`);
            setNudgeModalVisible(false);
            await loadData();
        } catch (err: unknown) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to send nudge');
        } finally {
            setActionLoading(false);
        }
    };

    const handleTriggerScanner = async () => {
        setActionLoading(true);
        try {
            const report = await triggerComplianceEscalations();
            Alert.alert(
                "Compliance Scan Complete",
                `Scanned ${report.scanned_merchants} merchants.\n` +
                `• SLA Breaches: ${report.sla_breaches_detected}\n` +
                `• Stale Balance Alerts: ${report.stale_balance_alarms}\n` +
                `• Nudges Required: ${report.unverified_nudges_triggered}`
            );
            await loadData();
        } catch (err: unknown) {
            Alert.alert('Scanner Error', err instanceof Error ? err.message : 'Failed to execute compliance scanner');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectNote.trim()) {
            Alert.alert("Required", "Please provide a reason for rejection.");
            return;
        }

        setActionLoading(true);
        try {
            if (selectedProfileId) {
                await rejectPayment(selectedProfileId, rejectNote.trim());
                Alert.alert("Success", "Profile setup fee rejected.");
            } else if (selectedMerchantId) {
                await reviewMerchantKYC(selectedMerchantId, 'reject', rejectNote.trim());
                Alert.alert("Success", "Merchant KYC rejected.");
            }
            setRejectModalVisible(false);
            await loadData();
        } catch (err: unknown) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    if (isLoadingProfile || loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <PageHeader title="Compliance & Proofs" showBack />
                <ActivityIndicator size="large" color={theme.colors.navy} style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <PageHeader title="Compliance & Proofs" showBack />

            {/* Segmented Control & Governance Action */}
            <View style={styles.segmentContainer}>
                <TouchableOpacity
                    style={[styles.segmentBtn, activeTab === 'proofs' && styles.segmentBtnActive]}
                    onPress={() => setActiveTab('proofs')}
                >
                    <Ionicons
                        name="receipt-outline"
                        size={16}
                        color={activeTab === 'proofs' ? '#FFFFFF' : '#6B7280'}
                    />
                    <Text style={[styles.segmentText, activeTab === 'proofs' && styles.segmentTextActive]}>
                        Proofs ({proofs.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.segmentBtn, activeTab === 'kyc' && styles.segmentBtnActive]}
                    onPress={() => setActiveTab('kyc')}
                >
                    <Ionicons
                        name="shield-checkmark-outline"
                        size={16}
                        color={activeTab === 'kyc' ? '#FFFFFF' : '#6B7280'}
                    />
                    <Text style={[styles.segmentText, activeTab === 'kyc' && styles.segmentTextActive]}>
                        KYC ({kycQueue.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.scannerScanBtn}
                    onPress={handleTriggerScanner}
                    disabled={actionLoading}
                >
                    <Ionicons name="scan-outline" size={16} color="#4B5563" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {activeTab === 'proofs' ? (
                    <>
                        <Text style={styles.sectionTitle}>Pending Setup Proofs ({proofs.length})</Text>

                        {proofs.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="checkmark-done-circle-outline" size={48} color="#10B981" />
                                <Text style={styles.emptyText}>All caught up!</Text>
                                <Text style={styles.emptySubtext}>No pending payment proofs to review.</Text>
                            </View>
                        ) : (
                            proofs.map(proof => (
                                <View key={proof.profile_id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardHeaderLeft}>
                                            <Text style={styles.profileName}>{proof.name}</Text>
                                            <Text style={styles.profileEmail}>{proof.email}</Text>
                                            {proof.business_name && (
                                                <Text style={styles.businessName}>Business: {proof.business_name}</Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.proofSection}>
                                        {proof.setup_fee_proof_url ? (
                                            <TouchableOpacity
                                                style={styles.viewProofBtn}
                                                onPress={() => Linking.openURL(proof.setup_fee_proof_url!)}
                                            >
                                                <Ionicons name="image-outline" size={20} color={theme.colors.navy} />
                                                <Text style={styles.viewProofText}>View Uploaded Proof</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <Text style={styles.noProofText}>No file uploaded.</Text>
                                        )}
                                    </View>

                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.rejectBtn]}
                                            onPress={() => openRejectModal(proof.profile_id)}
                                            disabled={actionLoading}
                                        >
                                            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                                            <Text style={styles.rejectBtnText}>Reject</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.approveBtn]}
                                            onPress={() => handleApprove(proof.profile_id)}
                                            disabled={actionLoading}
                                        >
                                            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                                            <Text style={styles.approveBtnText}>Approve</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Merchant KYC Compliance Queue ({kycQueue.length})</Text>

                        {kycQueue.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="shield-checkmark-outline" size={48} color="#10B981" />
                                <Text style={styles.emptyText}>Compliance Verified</Text>
                                <Text style={styles.emptySubtext}>No merchant KYC documents currently awaiting review.</Text>
                            </View>
                        ) : (
                            kycQueue.map(item => (
                                <View key={item.merchant_id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardHeaderLeft}>
                                            <Text style={styles.profileName}>{item.merchant_name}</Text>
                                            {item.email && <Text style={styles.profileEmail}>{item.email}</Text>}
                                            {item.business_registration_number && (
                                                <Text style={styles.kycMetaText}>CIPC: {item.business_registration_number}</Text>
                                            )}
                                            {item.tax_number && (
                                                <Text style={styles.kycMetaText}>Tax Ref: {item.tax_number}</Text>
                                            )}
                                        </View>
                                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                            <View style={styles.statusBadge}>
                                                <Text style={styles.statusBadgeText}>
                                                    {item.verification_status.toUpperCase()}
                                                </Text>
                                            </View>
                                            {item.sla_status && (
                                                <View style={[
                                                    styles.slaBadge,
                                                    item.sla_status === 'breached' ? styles.slaBadgeBreached :
                                                    item.sla_status === 'approaching_sla' ? styles.slaBadgeApproaching :
                                                    styles.slaBadgeOnTrack
                                                ]}>
                                                    <Text style={[
                                                        styles.slaBadgeText,
                                                        item.sla_status === 'breached' ? styles.slaBadgeTextBreached :
                                                        item.sla_status === 'approaching_sla' ? styles.slaBadgeTextApproaching :
                                                        styles.slaBadgeTextOnTrack
                                                    ]}>
                                                        {item.sla_status === 'breached' ? `🔴 SLA Breached (${item.pending_hours}h)` :
                                                         item.sla_status === 'approaching_sla' ? `🟡 Urgency Alert (${item.pending_hours}h)` :
                                                         `🟢 Within SLA (${item.pending_hours}h)`}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {item.unclaimed_balance && item.unclaimed_balance > 0 ? (
                                        <View style={styles.frozenBalanceBanner}>
                                            <Ionicons name="lock-closed" size={14} color="#B45309" />
                                            <Text style={styles.frozenBalanceText}>
                                                Frozen Balance: R{item.unclaimed_balance.toFixed(2)} held pending compliance
                                            </Text>
                                        </View>
                                    ) : null}

                                    <View style={styles.proofSection}>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                            {item.id_document_url && (
                                                <TouchableOpacity
                                                    style={styles.viewProofBtn}
                                                    onPress={() => Linking.openURL(item.id_document_url!)}
                                                >
                                                    <Ionicons name="person-outline" size={18} color={theme.colors.navy} />
                                                    <Text style={styles.viewProofText}>View ID Doc</Text>
                                                </TouchableOpacity>
                                            )}
                                            {item.proof_of_address_url && (
                                                <TouchableOpacity
                                                    style={styles.viewProofBtn}
                                                    onPress={() => Linking.openURL(item.proof_of_address_url!)}
                                                >
                                                    <Ionicons name="home-outline" size={18} color={theme.colors.navy} />
                                                    <Text style={styles.viewProofText}>Proof of Address</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.nudgeBtn]}
                                            onPress={() => openNudgeModal(item.merchant_id, item.merchant_name)}
                                            disabled={actionLoading}
                                        >
                                            <Ionicons name="notifications-outline" size={16} color="#4B5563" />
                                            <Text style={styles.nudgeBtnText}>Nudge</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.rejectBtn]}
                                            onPress={() => openRejectKycModal(item.merchant_id)}
                                            disabled={actionLoading}
                                        >
                                            <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                                            <Text style={styles.rejectBtnText}>Reject</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.approveBtn]}
                                            onPress={() => handleApproveKYC(item.merchant_id)}
                                            disabled={actionLoading}
                                        >
                                            <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
                                            <Text style={styles.approveBtnText}>Approve</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}
            </ScrollView>

            <Modal visible={rejectModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reject Payment Proof</Text>
                        <Text style={styles.modalSub}>Provide a reason for the steward.</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Image is blurry..."
                            value={rejectNote}
                            onChangeText={setRejectNote}
                            multiline
                            numberOfLines={3}
                            autoFocus
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalCancelBtn]}
                                onPress={() => setRejectModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalRejectSubmitBtn]}
                                onPress={handleReject}
                                disabled={actionLoading}
                            >
                                <Text style={styles.modalRejectText}>{actionLoading ? "Rejecting..." : "Reject Profile"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Merchant Compliance Nudge Modal */}
            <Modal visible={nudgeModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Ionicons name="notifications" size={22} color="#2A9D8F" />
                            <Text style={styles.modalTitle}>Nudge Merchant</Text>
                        </View>
                        <Text style={styles.modalSub}>
                            Send compliance instructions to {nudgeMerchantName} to request document updates or corrections.
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Type guidance message..."
                            value={nudgeMessage}
                            onChangeText={setNudgeMessage}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalCancelBtn]}
                                onPress={() => setNudgeModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#2A9D8F' }]}
                                onPress={handleSendNudge}
                                disabled={actionLoading}
                            >
                                <Text style={[styles.modalRejectText, { color: '#FFFFFF' }]}>
                                    {actionLoading ? "Sending..." : "Dispatch Nudge"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    container: { flex: 1 },
    content: { padding: 24, paddingBottom: 60 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
    emptyState: { alignItems: 'center', marginTop: 40, padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16 },
    emptySubtext: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    cardHeaderLeft: { flex: 1 },
    profileName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
    profileEmail: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
    businessName: { fontSize: 14, fontWeight: '500', color: theme.colors.navy },
    proofSection: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 16, marginBottom: 16, alignItems: 'center' },
    viewProofBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
    viewProofText: { fontSize: 14, fontWeight: '600', color: theme.colors.navy },
    noProofText: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' },
    actionsRow: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 6 },
    rejectBtn: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
    rejectBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
    approveBtn: { backgroundColor: '#10B981' },
    approveBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
    modalSub: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
    modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 24 },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalCancelBtn: { backgroundColor: '#F3F4F6' },
    modalCancelText: { color: '#4B5563', fontWeight: '600', fontSize: 16 },
    modalRejectSubmitBtn: { backgroundColor: '#EF4444' },
    modalRejectText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
    segmentContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 4,
        gap: 12,
    },
    segmentBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    segmentBtnActive: {
        backgroundColor: '#2A9D8F',
        borderColor: '#2A9D8F',
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    segmentTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    kycMetaText: {
        fontSize: 12,
        color: '#4B5563',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#D97706',
    },
    scannerScanBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slaBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    slaBadgeOnTrack: {
        backgroundColor: '#ECFDF5',
    },
    slaBadgeApproaching: {
        backgroundColor: '#FEF3C7',
    },
    slaBadgeBreached: {
        backgroundColor: '#FEE2E2',
    },
    slaBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    slaBadgeTextOnTrack: {
        color: '#059669',
    },
    slaBadgeTextApproaching: {
        color: '#D97706',
    },
    slaBadgeTextBreached: {
        color: '#DC2626',
    },
    frozenBalanceBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 12,
    },
    frozenBalanceText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
    },
    nudgeBtn: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    nudgeBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
});
