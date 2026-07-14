import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth';
import { supabase } from '@/shared/api/supabase';

interface DiagnosticState {
    health: '🟢 Healthy' | '🟡 Loading' | '🔴 Failed' | 'N/A';
    healthLatency: string;
    version: string;
    versionLatency: string;
    ready: '🟢 Ready' | '🟡 Loading' | '🔴 Failed' | 'N/A';
    readyLatency: string;
    
    // Storage
    storageReachable: '🟢 Reachable' | '🔴 Unreachable' | 'Checking...';
    bucketExists: '🟢 Exists' | '🔴 Missing' | 'Checking...';
    uploadStatus: '🟢 Passed' | '🔴 Failed' | 'Checking...';
    deleteStatus: '🟢 Passed' | '🔴 Failed' | 'Checking...';
    publicUrlStatus: '🟢 Passed' | '🔴 Failed' | 'Checking...';
}

export default function DeveloperScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const session = useSession();
    
    const [jwtExpiry, setJwtExpiry] = useState<string>('Loading...');
    const [refreshTokenStatus, setRefreshTokenStatus] = useState<string>('Loading...');
    const [diagnostics, setDiagnostics] = useState<DiagnosticState>({
        health: 'N/A',
        healthLatency: '—',
        version: '—',
        versionLatency: '—',
        ready: 'N/A',
        readyLatency: '—',
        storageReachable: 'Checking...',
        bucketExists: 'Checking...',
        uploadStatus: 'Checking...',
        deleteStatus: 'Checking...',
        publicUrlStatus: 'Checking...',
    });
    const [loading, setLoading] = useState(false);

    const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    const buildMode = __DEV__ ? 'Development' : 'Production';

    const getEngineStatus = (prefix: string) => {
        const queries = queryClient.getQueryCache().findAll({ queryKey: [prefix], exact: false });
        if (queries.length === 0) return { label: '🔴 Uninitialized', color: '#EF4444' };
        const hasError = queries.some(q => q.state.status === 'error');
        const isLoading = queries.some(q => q.state.status === 'pending');
        if (hasError) return { label: '🔴 Failed', color: '#EF4444' };
        if (isLoading) return { label: '🟡 Loading', color: '#F59E0B' };
        return { label: '🟢 Healthy', color: '#10B981' };
    };

    const runBackendDiagnostics = async () => {
        setDiagnostics(prev => ({
            ...prev,
            health: '🟡 Loading',
            ready: '🟡 Loading',
        }));

        // 1. Health
        try {
            const start = Date.now();
            const res = await fetch(`${apiBaseUrl}/health`);
            const latency = Date.now() - start;
            if (res.ok) {
                setDiagnostics(prev => ({ ...prev, health: '🟢 Healthy', healthLatency: `${latency}ms` }));
            } else {
                setDiagnostics(prev => ({ ...prev, health: '🔴 Failed', healthLatency: `${latency}ms` }));
            }
        } catch (e) {
            setDiagnostics(prev => ({ ...prev, health: '🔴 Failed', healthLatency: 'timeout/error' }));
        }

        // 2. Version
        try {
            const start = Date.now();
            const res = await fetch(`${apiBaseUrl}/version`);
            const latency = Date.now() - start;
            if (res.ok) {
                const data = await res.json();
                setDiagnostics(prev => ({ ...prev, version: data.version || 'Unknown', versionLatency: `${latency}ms` }));
            } else {
                setDiagnostics(prev => ({ ...prev, version: '🔴 Failed', versionLatency: `${latency}ms` }));
            }
        } catch (e) {
            setDiagnostics(prev => ({ ...prev, version: '🔴 Failed', versionLatency: 'timeout/error' }));
        }

        // 3. Ready
        try {
            const start = Date.now();
            const res = await fetch(`${apiBaseUrl}/api/v1/ready`);
            const latency = Date.now() - start;
            if (res.ok) {
                setDiagnostics(prev => ({ ...prev, ready: '🟢 Ready', readyLatency: `${latency}ms` }));
            } else {
                setDiagnostics(prev => ({ ...prev, ready: '🔴 Failed', readyLatency: `${latency}ms` }));
            }
        } catch (e) {
            setDiagnostics(prev => ({ ...prev, ready: '🔴 Failed', readyLatency: 'timeout/error' }));
        }
    };

    const runStorageDiagnostics = async () => {
        setDiagnostics(prev => ({
            ...prev,
            storageReachable: 'Checking...',
            bucketExists: 'Checking...',
            uploadStatus: 'Checking...',
            deleteStatus: 'Checking...',
            publicUrlStatus: 'Checking...',
        }));

        try {
            // Reachable
            if (supabase.storage) {
                setDiagnostics(prev => ({ ...prev, storageReachable: '🟢 Reachable' }));
            } else {
                setDiagnostics(prev => ({ ...prev, storageReachable: '🔴 Unreachable' }));
                return;
            }

            // Bucket Exists (try list files)
            const bucketName = 'proof-of-work';
            const { data: listData, error: listError } = await supabase.storage.from(bucketName).list('', { limit: 1 });
            if (listError) {
                setDiagnostics(prev => ({
                    ...prev,
                    bucketExists: '🔴 Missing',
                    uploadStatus: '🔴 Failed',
                    deleteStatus: '🔴 Failed',
                    publicUrlStatus: '🔴 Failed',
                }));
                return;
            }
            setDiagnostics(prev => ({ ...prev, bucketExists: '🟢 Exists' }));

            // Test Upload
            const fileName = `diag-test-${Date.now()}.txt`;
            const content = 'iPhande Diagnostics Text';
            // We use Blob or ArrayBuffer for Expo compatibility
            const fileData = new Blob([content], { type: 'text/plain' });
            
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, fileData, { contentType: 'text/plain', upsert: true });

            if (uploadError) {
                setDiagnostics(prev => ({
                    ...prev,
                    uploadStatus: '🔴 Failed',
                    deleteStatus: '🔴 Failed',
                    publicUrlStatus: '🔴 Failed',
                }));
                return;
            }
            setDiagnostics(prev => ({ ...prev, uploadStatus: '🟢 Passed' }));

            // Test Public URL & fetching it
            const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
            if (urlData?.publicUrl) {
                try {
                    const fetchRes = await fetch(urlData.publicUrl);
                    if (fetchRes.ok) {
                        setDiagnostics(prev => ({ ...prev, publicUrlStatus: '🟢 Passed' }));
                    } else {
                        setDiagnostics(prev => ({ ...prev, publicUrlStatus: '🔴 Failed' }));
                    }
                } catch (e) {
                    setDiagnostics(prev => ({ ...prev, publicUrlStatus: '🔴 Failed' }));
                }
            } else {
                setDiagnostics(prev => ({ ...prev, publicUrlStatus: '🔴 Failed' }));
            }

            // Test Delete
            const { error: deleteError } = await supabase.storage.from(bucketName).remove([fileName]);
            if (deleteError) {
                setDiagnostics(prev => ({ ...prev, deleteStatus: '🔴 Failed' }));
            } else {
                setDiagnostics(prev => ({ ...prev, deleteStatus: '🟢 Passed' }));
            }

        } catch (e) {
            console.error('Storage diagnostics error:', e);
        }
    };

    const loadSessionDetails = async () => {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession) {
            setJwtExpiry(sbSession.expires_at ? new Date(sbSession.expires_at * 1000).toLocaleString() : 'N/A');
            setRefreshTokenStatus(sbSession.refresh_token ? 'Available' : 'N/A');
        } else {
            setJwtExpiry('No Active Session');
            setRefreshTokenStatus('N/A');
        }
    };

    const runAll = async () => {
        setLoading(true);
        await Promise.all([
            runBackendDiagnostics(),
            runStorageDiagnostics(),
            loadSessionDetails(),
        ]);
        setLoading(false);
    };

    useEffect(() => {
        runAll();
    }, []);

    // React Query Cache Stats
    const cacheQueries = queryClient.getQueryCache().getAll();
    const staleQueriesCount = cacheQueries.filter(q => q.isStale()).length;
    const activeMutationsCount = queryClient.getMutationCache().getAll().filter(m => m.state.status === 'pending').length;

    // Feature Engines Status
    const engines = [
        { name: 'Authentication', prefix: 'bootstrap' },
        { name: 'Business', prefix: 'business' },
        { name: 'Dashboard', prefix: 'dashboard' },
        { name: 'Opportunity', prefix: 'opportunities' },
        { name: 'Lead', prefix: 'leads' },
        { name: 'Quote', prefix: 'quotes' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>iPhande Control Panel</Text>
                    <Text style={styles.subtitle}>Diagnostics & System Observability</Text>
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#10B981" />
                        <Text style={styles.loadingText}>Running diagnostics...</Text>
                    </View>
                )}

                {/* Section: Environment */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Environment</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Build Mode</Text>
                            <Text style={styles.value}>{buildMode}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>API Base URL</Text>
                            <Text style={styles.value} numberOfLines={1}>{apiBaseUrl}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Supabase URL</Text>
                            <Text style={styles.value} numberOfLines={1}>{supabaseUrl}</Text>
                        </View>
                    </View>
                </View>

                {/* Section: Backend Health */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Backend Endpoints</Text>
                        <TouchableOpacity onPress={runBackendDiagnostics}>
                            <Text style={styles.refreshText}>Run Checks</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>/health</Text>
                            <Text style={styles.value}>{diagnostics.health} ({diagnostics.healthLatency})</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>/version</Text>
                            <Text style={styles.value}>{diagnostics.version} ({diagnostics.versionLatency})</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>/api/v1/ready</Text>
                            <Text style={styles.value}>{diagnostics.ready} ({diagnostics.readyLatency})</Text>
                        </View>
                    </View>
                </View>

                {/* Section: Authentication */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Authentication</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>User Email</Text>
                            <Text style={styles.value}>{session.identity?.email || 'Guest'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>User ID</Text>
                            <Text style={styles.value} numberOfLines={1}>{session.identity?.id || '—'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Selected Business</Text>
                            <Text style={styles.value}>{session.selectedBusiness?.displayName || 'None'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>JWT Expiry</Text>
                            <Text style={styles.value}>{jwtExpiry}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Refresh Token</Text>
                            <Text style={styles.value}>{refreshTokenStatus}</Text>
                        </View>
                    </View>
                </View>

                {/* Section: Storage */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Storage (Supabase)</Text>
                        <TouchableOpacity onPress={runStorageDiagnostics}>
                            <Text style={styles.refreshText}>Test Upload</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Reachable</Text>
                            <Text style={styles.value}>{diagnostics.storageReachable}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Bucket (proof-of-work)</Text>
                            <Text style={styles.value}>{diagnostics.bucketExists}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Upload Test</Text>
                            <Text style={styles.value}>{diagnostics.uploadStatus}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Public URL Test</Text>
                            <Text style={styles.value}>{diagnostics.publicUrlStatus}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Delete Test</Text>
                            <Text style={styles.value}>{diagnostics.deleteStatus}</Text>
                        </View>
                    </View>
                </View>

                {/* Section: React Query Cache */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>React Query Cache</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Cached Queries</Text>
                            <Text style={styles.value}>{cacheQueries.length}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Stale Queries</Text>
                            <Text style={styles.value}>{staleQueriesCount}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Active Mutations</Text>
                            <Text style={styles.value}>{activeMutationsCount}</Text>
                        </View>
                    </View>
                </View>

                {/* Section: Feature Engines */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Feature Engines Health</Text>
                    <View style={styles.card}>
                        {engines.map(engine => {
                            const status = getEngineStatus(engine.prefix);
                            return (
                                <View style={styles.row} key={engine.name}>
                                    <Text style={styles.label}>{engine.name}</Text>
                                    <Text style={[styles.value, { color: status.color }]}>{status.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <TouchableOpacity style={styles.btnAll} onPress={runAll}>
                    <Text style={styles.btnAllText}>Run All Diagnostics</Text>
                </TouchableOpacity>

                <View style={styles.spacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    scroll: { padding: 20 },
    header: { marginBottom: 24 },
    backBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#1e293b', borderRadius: 8, marginBottom: 12 },
    backBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: '800', color: '#f8fafc', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#64748b' },
    loadingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 12, borderRadius: 12, gap: 10, marginBottom: 20 },
    loadingText: { color: '#94a3b8', fontSize: 13 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
    refreshText: { color: '#10b981', fontSize: 13, fontWeight: '600' },
    card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, gap: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { color: '#94a3b8', fontSize: 14 },
    value: { color: '#f8fafc', fontSize: 14, fontWeight: '600', maxWidth: '60%' },
    btnAll: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
    btnAllText: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
    spacer: { height: 40 }
});
