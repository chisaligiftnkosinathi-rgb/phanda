import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WidgetProps, WorkWidgetData } from '../types';

export function WorkCard({ state, data }: WidgetProps<WorkWidgetData>) {
    if (state === 'unavailable' || state === 'maintenance' || !data) {
        return null;
    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Work Status</Text>
            <View style={styles.grid}>
                <View style={styles.item}>
                    <Text style={styles.value}>{data.openOpportunities}</Text>
                    <Text style={styles.label}>Opportunities</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.value}>{data.activeLeads}</Text>
                    <Text style={styles.label}>Active Leads</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12, flexGrow: 1, minWidth: 140 },
    title: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 12 },
    grid: { flexDirection: 'row', gap: 16 },
    item: { flex: 1 },
    value: { fontSize: 18, fontWeight: '700', color: '#111827' },
    label: { fontSize: 11, color: '#6B7280', marginTop: 2 }
});
