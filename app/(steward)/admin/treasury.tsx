import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Alert,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/features/auth';
import {
    getTreasurySummary,
    getTreasuryTransactions,
    getPayoutQueue,
    settleMerchantEarnings,
    TreasurySummary,
    TreasuryTransaction,
    PayoutQueueItem
} from '@/api/adminApi';
import { theme } from '@/config/theme';
import { PageHeader } from '@/components/PageHeader';

export default function TreasuryDashboardScreen() {
    const router = useRouter();
    const { platformRole, loading: isLoadingProfile } = useSession();

    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts'>('overview');
    const [summary, setSummary] = useState<TreasurySummary | null>(null);
    const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
    const [payouts, setPayouts] = useState<PayoutQueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [settlingMerchantId, setSettlingMerchantId] = useState<string | null>(null);

    const loadDashboardData = async () => {
        try {
            const [sumData, txData, payoutData] = await Promise.all([
                getTreasurySummary(),
                getTreasuryTransactions(25, 0),
                getPayoutQueue()
            ]);
            setSummary(sumData);
            setTransactions(txData);
            setPayouts(payoutData);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to load treasury data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!isLoadingProfile && platformRole !== 'admin' && platformRole !== 'owner') {
            Alert.alert('Access Denied', 'SupaAdmin / Owner permission required.');
            router.replace('/tabs/home');
            return;
        }

        if (platformRole === 'admin' || platformRole === 'owner') {
            loadDashboardData();
        }
    }, [platformRole, isLoadingProfile]);

    const handleSettleMerchant = async (merchantId: string, merchantName: string, amount: number) => {
        Alert.alert(
            'Confirm Settlement',
            `Disburse and mark R${amount.toFixed(2)} as settled for ${merchantName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm Payout',
                    style: 'default',
                    onPress: async () => {
                        setSettlingMerchantId(merchantId);
                        try {
                            const res = await settleMerchantEarnings(
                                merchantId,
                                `EFT-${Date.now().toString().slice(-6)}`,
                                'Settled via SupaAdmin Treasury Console'
                            );
                            Alert.alert('Settlement Complete', res.message || 'Earnings settled successfully.');
                            loadDashboardData();
                        } catch (err: any) {
                            Alert.alert('Settlement Failed', err.message || 'Could not settle earnings.');
                        } finally {
                            setSettlingMerchantId(null);
                        }
                    }
                }
            ]
        );
    };

    if (isLoadingProfile || loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <PageHeader title="Treasury Governance" showBack />
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <PageHeader title="Treasury & Revenue" showBack />

            {/* Segmented Control Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Ionicons
                        name="wallet-outline"
                        size={16}
                        color={activeTab === 'overview' ? theme.colors.primary : '#64748B'}
                    />
                    <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'transactions' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('transactions')}
                >
                    <Ionicons
                        name="receipt-outline"
                        size={16}
                        color={activeTab === 'transactions' ? theme.colors.primary : '#64748B'}
                    />
                    <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}>
                        Ledger Feed
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'payouts' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('payouts')}
                >
                    <Ionicons
                        name="cash-outline"
                        size={16}
                        color={activeTab === 'payouts' ? theme.colors.primary : '#64748B'}
                    />
                    <Text style={[styles.tabText, activeTab === 'payouts' && styles.tabTextActive]}>
                        Payouts ({payouts.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboardData(); }} />
                }
            >
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <View>
                        {/* Primary Platform Revenue Banner */}
                        <View style={styles.vaultBanner}>
                            <View>
                                <Text style={styles.vaultLabel}>Platform Treasury Vault (10% Split)</Text>
                                <Text style={styles.vaultValue}>
                                    R{(summary?.platform_fee_revenue || 0).toFixed(2)}
                                </Text>
                            </View>
                            <View style={styles.vaultIconContainer}>
                                <Ionicons name="shield-checkmark" size={28} color="#2A9D8F" />
                            </View>
                        </View>

                        {/* Financial Metrics Grid */}
                        <View style={styles.grid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Gross Volume (GMV)</Text>
                                <Text style={styles.statValue}>
                                    R{(summary?.gross_transaction_volume || 0).toFixed(2)}
                                </Text>
                                <Text style={styles.statSubtext}>{summary?.paid_orders_count || 0} Paid Orders</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Merchant Net (90%)</Text>
                                <Text style={styles.statValue}>
                                    R{(summary?.merchant_earnings_total || 0).toFixed(2)}
                                </Text>
                                <Text style={styles.statSubtext}>Total Value Generated</Text>
                            </View>
                        </View>

                        <View style={styles.grid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Pending Disbursements</Text>
                                <Text style={[styles.statValue, { color: '#E76F51' }]}>
                                    R{(summary?.merchant_payout_pending || 0).toFixed(2)}
                                </Text>
                                <Text style={styles.statSubtext}>{payouts.length} Merchants in Queue</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Total Orders Tracked</Text>
                                <Text style={styles.statValue}>{summary?.total_orders_count || 0}</Text>
                                <Text style={styles.statSubtext}>Omnichannel Marketplace</Text>
                            </View>
                        </View>

                        {/* Payment Gateways Breakdown */}
                        <Text style={styles.sectionTitle}>Volume by Payment Gateway</Text>
                        <View style={styles.breakdownCard}>
                            {['payfast', 'paystack', 'payjustnow'].map((gw) => {
                                const data = summary?.gateway_breakdown?.[gw] || { order_count: 0, volume: 0 };
                                const label = gw === 'payfast' ? 'PayFast (Instant EFT & Cards)' : gw === 'paystack' ? 'Paystack (Cards & Bank)' : 'PayJustNow (3x BNPL)';
                                return (
                                    <View key={gw} style={styles.breakdownRow}>
                                        <View style={styles.breakdownLeft}>
                                            <Ionicons name="card-outline" size={18} color="#4B5563" />
                                            <Text style={styles.breakdownLabel}>{label}</Text>
                                        </View>
                                        <View style={styles.breakdownRight}>
                                            <Text style={styles.breakdownValue}>R{data.volume.toFixed(2)}</Text>
                                            <Text style={styles.breakdownSub}>({data.order_count} orders)</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Logistics Carriers Breakdown */}
                        <Text style={styles.sectionTitle}>Logistics & Fulfillment Channels</Text>
                        <View style={styles.breakdownCard}>
                            {['courier_guy', 'pudo', 'pickup'].map((cr) => {
                                const data = summary?.carrier_breakdown?.[cr] || { shipment_count: 0 };
                                const label = cr === 'courier_guy' ? 'The Courier Guy (Door-to-Door)' : cr === 'pudo' ? 'Pudo Smart Lockers (24/7)' : 'Store Counter Pickup';
                                return (
                                    <View key={cr} style={styles.breakdownRow}>
                                        <View style={styles.breakdownLeft}>
                                            <Ionicons name="cube-outline" size={18} color="#4B5563" />
                                            <Text style={styles.breakdownLabel}>{label}</Text>
                                        </View>
                                        <View style={styles.breakdownRight}>
                                            <Text style={styles.breakdownValue}>{data.shipment_count} deliveries</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* 2. TRANSACTIONS TAB */}
                {activeTab === 'transactions' && (
                    <View>
                        <Text style={styles.sectionTitle}>Recent Audited Fee Splits</Text>
                        {transactions.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No fee ledger transactions found yet.</Text>
                            </View>
                        ) : (
                            transactions.map((tx) => (
                                <View key={tx.id} style={styles.txCard}>
                                    <View style={styles.txHeader}>
                                        <View>
                                            <Text style={styles.txOrderNumber}>{tx.order_number}</Text>
                                            <Text style={styles.txBuyer}>{tx.buyer_email || 'Direct Checkout'}</Text>
                                        </View>
                                        <View style={styles.badgeSuccess}>
                                            <Text style={styles.badgeTextSuccess}>{tx.status.toUpperCase()}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.txSplitRow}>
                                        <View>
                                            <Text style={styles.splitSubLabel}>Gross Amount</Text>
                                            <Text style={styles.splitAmount}>R{tx.total_amount.toFixed(2)}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.splitSubLabel}>Platform Fee (10%)</Text>
                                            <Text style={[styles.splitAmount, { color: '#2A9D8F' }]}>
                                                +R{tx.platform_fee_10pct.toFixed(2)}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.splitSubLabel}>Merchant Share (90%)</Text>
                                            <Text style={styles.splitAmount}>R{tx.merchant_earning_90pct.toFixed(2)}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.txFooter}>
                                        <Text style={styles.txMerchant}>Merchant: {tx.merchant_name}</Text>
                                        <Text style={styles.txDate}>
                                            {new Date(tx.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* 3. PAYOUTS QUEUE TAB */}
                {activeTab === 'payouts' && (
                    <View>
                        <Text style={styles.sectionTitle}>Merchant Settlement Queue</Text>
                        <Text style={styles.sectionSubtitle}>
                            Disburse accumulated 90% earnings to merchant verified bank accounts.
                        </Text>

                        {payouts.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="checkmark-done-circle-outline" size={48} color="#2A9D8F" />
                                <Text style={styles.emptyText}>All merchant earnings are fully settled!</Text>
                            </View>
                        ) : (
                            payouts.map((p) => (
                                <View key={p.merchant_id} style={styles.payoutCard}>
                                    <View style={styles.payoutHeader}>
                                        <View>
                                            <Text style={styles.payoutMerchantName}>{p.merchant_name}</Text>
                                            <Text style={styles.payoutEmail}>{p.email || 'No email registered'}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.payoutAmountLabel}>Available</Text>
                                            <Text style={styles.payoutAmount}>R{p.available_balance.toFixed(2)}</Text>
                                        </View>
                                    </View>

                                    {/* Bank Coordinate Details */}
                                    <View style={styles.bankDetailsContainer}>
                                        <View style={styles.bankDetailItem}>
                                            <Text style={styles.bankDetailKey}>Bank:</Text>
                                            <Text style={styles.bankDetailVal}>{p.bank_name}</Text>
                                        </View>
                                        <View style={styles.bankDetailItem}>
                                            <Text style={styles.bankDetailKey}>Account:</Text>
                                            <Text style={styles.bankDetailVal}>{p.account_number}</Text>
                                        </View>
                                        <View style={styles.bankDetailItem}>
                                            <Text style={styles.bankDetailKey}>Branch:</Text>
                                            <Text style={styles.bankDetailVal}>{p.branch_code}</Text>
                                        </View>
                                    </View>

                                    {/* Action Button */}
                                    <TouchableOpacity
                                        style={styles.settleButton}
                                        disabled={settlingMerchantId === p.merchant_id}
                                        onPress={() => handleSettleMerchant(p.merchant_id, p.merchant_name, p.available_balance)}
                                    >
                                        {settlingMerchantId === p.merchant_id ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <>
                                                <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                                                <Text style={styles.settleButtonText}>Disburse & Settle Payout</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        gap: 8,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        gap: 6,
    },
    tabButtonActive: {
        backgroundColor: '#E8F5F3',
        borderWidth: 1,
        borderColor: '#2A9D8F',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    tabTextActive: {
        color: '#2A9D8F',
    },
    vaultBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    vaultLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 4,
    },
    vaultValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2A9D8F',
    },
    vaultIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    statSubtext: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 12,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 12,
    },
    breakdownCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    breakdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    breakdownLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },
    breakdownRight: {
        alignItems: 'flex-end',
    },
    breakdownValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    breakdownSub: {
        fontSize: 11,
        color: '#94A3B8',
    },
    txCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    txHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    txOrderNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    txBuyer: {
        fontSize: 12,
        color: '#64748B',
    },
    badgeSuccess: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeTextSuccess: {
        fontSize: 10,
        fontWeight: '700',
        color: '#15803D',
    },
    txSplitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    splitSubLabel: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 2,
    },
    splitAmount: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    txFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    txMerchant: {
        fontSize: 12,
        color: '#64748B',
    },
    txDate: {
        fontSize: 11,
        color: '#94A3B8',
    },
    payoutCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    payoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    payoutMerchantName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    payoutEmail: {
        fontSize: 12,
        color: '#64748B',
    },
    payoutAmountLabel: {
        fontSize: 11,
        color: '#64748B',
        textAlign: 'right',
    },
    payoutAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2A9D8F',
    },
    bankDetailsContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    bankDetailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    bankDetailKey: {
        fontSize: 12,
        color: '#64748B',
    },
    bankDetailVal: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0F172A',
    },
    settleButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2A9D8F',
        borderRadius: 8,
        paddingVertical: 10,
    },
    settleButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 10,
    },
});
