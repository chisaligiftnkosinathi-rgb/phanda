import { StyleSheet, Text, View } from 'react-native';
import { WidgetProps, SystemWidgetData } from '../types';

export function SystemCard({ state, data, lastUpdated, error }: WidgetProps<SystemWidgetData>) {
    if (state === 'unavailable' || state === 'maintenance' || !data) {
        return null; // System card fails silently since it's typically an admin component
    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>System Telemetry</Text>
            
            <View style={styles.grid}>
                <View style={styles.item}>
                    <Text style={styles.meta}>Drift Score</Text>
                    <Text style={styles.value}>{data.driftScore !== undefined ? data.driftScore.toFixed(2) : '—'}</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.meta}>Active Profiles</Text>
                    <Text style={styles.value}>{data.activeProfiles !== undefined ? data.activeProfiles : '—'}</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.meta}>Pending Reviews</Text>
                    <Text style={styles.value}>{data.pendingReviews !== undefined ? data.pendingReviews : '—'}</Text>
                </View>
            </View>

            {data.dampingAction && data.dampingAction !== 'none' && (
                <View style={styles.dampingBox}>
                    <Text style={styles.dampingText}>DAMPING: {data.dampingAction}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12 },
    title: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    item: { width: '30%', flexGrow: 1 },
    meta: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    value: { fontSize: 18, fontWeight: '700', color: '#111827' },
    dampingBox: { marginTop: 12, padding: 8, backgroundColor: '#222', borderRadius: 6, alignSelf: 'flex-start' },
    dampingText: { color: 'orange', fontSize: 10, fontWeight: 'bold' },
});
