import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WidgetProps, WalletWidgetData } from '../types';

export function WalletCard({ state, data }: WidgetProps<WalletWidgetData>) {
    if (state === 'unavailable' || state === 'maintenance' || !data) {
        return null;
    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Wallet Balance</Text>
            <View style={styles.content}>
                <Text style={styles.balance}>{data.currency} {data.balance.toFixed(2)}</Text>
                {data.pendingPayouts > 0 && (
                    <Text style={styles.pending}>Pending: {data.currency} {data.pendingPayouts.toFixed(2)}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12, flexGrow: 1, minWidth: 140 },
    title: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 12 },
    content: { justifyContent: 'center' },
    balance: { fontSize: 20, fontWeight: '700', color: '#111827' },
    pending: { fontSize: 12, color: '#9CA3AF', marginTop: 4 }
});
