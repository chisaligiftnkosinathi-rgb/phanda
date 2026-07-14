import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WidgetProps, TrustWidgetData } from '../types';

export function TrustCard({ state, data }: WidgetProps<TrustWidgetData>) {
    if (state === 'unavailable' || state === 'maintenance' || !data) {
        return null;
    }

    const scoreColor = data.score >= 70 ? '#10B981' : data.score >= 40 ? '#F59E0B' : '#EF4444';

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Trust Level</Text>
            <View style={styles.content}>
                <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                    <Text style={styles.scoreText}>{data.score}%</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.levelText}>{data.level}</Text>
                    <Text style={styles.milestoneText}>Next: {data.nextMilestone}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12, flexGrow: 1, minWidth: 140 },
    title: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 12 },
    content: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    scoreBadge: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    scoreText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    textContainer: { flex: 1 },
    levelText: { fontSize: 15, fontWeight: '700', color: '#111827' },
    milestoneText: { fontSize: 12, color: '#6B7280', marginTop: 2 }
});
