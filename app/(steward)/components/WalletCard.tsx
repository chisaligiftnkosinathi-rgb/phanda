/**
 * WalletCard Component
 *
 * Displays earnings summary: pending, available, and paid amounts.
 */

import type { WalletInfo } from '@/types/dashboard';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardCard } from './DashboardCard';

interface WalletCardProps {
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
    data?: WalletInfo;
    onRequestPayout?: () => void;
}

export function WalletCard({ loading, error, onRetry, data, onRequestPayout }: WalletCardProps) {
    if (!data) {
        return <DashboardCard title="Wallet" loading={loading} error={error} onRetry={onRetry} />;
    }

    const formatCurrency = (amount: number, currency: string) => {
        return `${currency} ${amount.toFixed(2)}`;
    };

    return (
        <DashboardCard title="Money" loading={loading} error={error} onRetry={onRetry}>
            <View style={styles.container}>
                {/* Available earnings - primary focus */}
                <View style={styles.primarySection}>
                    <Text style={styles.primaryLabel}>Available to Withdraw</Text>
                    <Text style={styles.primaryAmount}>{formatCurrency(parseFloat(data.available_amount), data.currency)}</Text>
                    {parseFloat(data.available_amount) > 0 && (
                        <TouchableOpacity style={styles.payoutButton} onPress={onRequestPayout}>
                            <Text style={styles.payoutButtonText}>Request Payout</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Secondary figures */}
                <View style={styles.secondarySection}>
                    <View style={styles.secondaryItem}>
                        <Text style={styles.secondaryLabel}>Pending Verification</Text>
                        <Text style={styles.secondaryAmount}>{formatCurrency(parseFloat(data.pending_amount), data.currency)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.secondaryItem}>
                        <Text style={styles.secondaryLabel}>Already Paid</Text>
                        <Text style={styles.secondaryAmount}>{formatCurrency(parseFloat(data.paid_amount), data.currency)}</Text>
                    </View>
                </View>

                {/* Last sync timestamp */}
                <Text style={styles.timestamp}>Updated {formatTime(data.last_updated)}</Text>
            </View>
        </DashboardCard>
    );
}

function formatTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    primarySection: {
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    primaryLabel: {
        fontSize: 12,
        color: '#558B2F',
        marginBottom: 8,
    },
    primaryAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2E7D32',
        marginBottom: 12,
    },
    payoutButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 6,
        width: '100%',
        alignItems: 'center',
    },
    payoutButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    secondarySection: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        overflow: 'hidden',
    },
    secondaryItem: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: '#DDD',
    },
    secondaryLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 6,
    },
    secondaryAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    timestamp: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
    },
});
