import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/features/auth';
import { DashboardStats, getAdminDashboard } from '@/api/adminApi';
import { theme } from '@/config/theme';
import { PageHeader } from '@/components/PageHeader';

export default function VbaConsoleScreen() {
    const router = useRouter();
    const { selectedBusiness: profile, loading, platformRole } = useSession();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const data = await getAdminDashboard();
            setStats(data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load console data';
            Alert.alert('Error', msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!loading && platformRole !== 'admin') {
            Alert.alert('Access Denied', 'You do not have permission to view this page.');
            router.replace('/tabs/home');
            return;
        }

        if (platformRole === 'admin') {
            fetchStats();
        }
    }, [platformRole, loading, router, fetchStats]);

    if (loading || isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <PageHeader title="VBA Console" showBack />
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <PageHeader title="VBA Console" showBack />

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>

                <View style={styles.heroSection}>
                    <Ionicons name="hardware-chip-outline" size={48} color="#059669" />
                    <Text style={styles.heroTitle}>Visual Business Architecture</Text>
                    <Text style={styles.heroSubtitle}>Platform wide telemetry and diagnostics.</Text>
                </View>

                <Text style={styles.sectionTitle}>System Telemetry</Text>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>System Owner</Text>
                        <Text style={[styles.tableValue, { color: theme.colors.navy, fontWeight: '700' }]}>
                            Global IT and Business Solutions
                        </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>Total Profiles</Text>
                        <Text style={styles.tableValue}>{stats?.total_profiles || 0}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>Active Stewards (Approved)</Text>
                        <Text style={styles.tableValue}>{stats?.approved_profiles || 0}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>Pending Payment Proofs</Text>
                        <Text style={styles.tableValue}>{stats?.pending_reviews || 0}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>Total Opportunities</Text>
                        <Text style={styles.tableValue}>{stats?.total_opportunities || 0}</Text>
                    </View>
                </View>

                <View style={styles.noteBox}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.navy} />
                    <Text style={styles.noteText}>
                        This console is currently in Read-Only mode for V1 Simulation. Future updates will include live continuity graph diagnostics.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    container: { flex: 1 },
    content: { padding: 24, paddingBottom: 60 },

    heroSection: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
    heroTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 12 },
    heroSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },

    table: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', marginBottom: 24 },
    tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    tableLabel: { fontSize: 15, color: '#4B5563', fontWeight: '500' },
    tableValue: { fontSize: 15, color: '#111827', fontWeight: '600' },

    noteBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE', gap: 12 },
    noteText: { flex: 1, fontSize: 14, color: '#1E3A8A', lineHeight: 20 },
});
