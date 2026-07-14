import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/features/auth';
import { demoteAdmin, getUsers, promoteAdmin, UserAdmin } from '@/api/adminApi';
import { theme } from '@/config/theme';
import { PageHeader } from '@/components/PageHeader';

export default function AdminUsersScreen() {
    const router = useRouter();
    const { identity: user, platformRole, loading: isLoadingProfile } = useSession();
    const [users, setUsers] = useState<UserAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load users';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoadingProfile && platformRole !== 'admin' && platformRole !== 'owner') {
            Alert.alert('Access Denied', 'You do not have permission to view this page.');
            router.replace('/tabs/home');
            return;
        }

        if (platformRole === 'admin' || platformRole === 'owner') {
            loadUsers();
        }
    }, [platformRole, isLoadingProfile, router, loadUsers]);

    const handlePromote = async (userId: string, userName: string) => {
        Alert.alert(
            "Promote to Admin",
            `Are you sure you want to promote ${userName} to Admin?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Promote",
                    style: "default",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await promoteAdmin(userId);
                            Alert.alert("Success", "User has been promoted to Admin.");
                            await loadUsers();
                        } catch (err: unknown) {
                            const msg = err instanceof Error ? err.message : 'Failed to promote user';
                            Alert.alert('Error', msg);
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDemote = async (userId: string, userName: string) => {
        if (userId === user?.id) {
            Alert.alert("Action Denied", "You cannot demote yourself.");
            return;
        }

        Alert.alert(
            "Demote Admin",
            `Are you sure you want to demote ${userName} to Steward?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Demote",
                    style: "destructive",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await demoteAdmin(userId);
                            Alert.alert("Success", "User has been demoted to Steward.");
                            await loadUsers();
                        } catch (err: unknown) {
                            const msg = err instanceof Error ? err.message : 'Failed to demote user';
                            Alert.alert('Error', msg);
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoadingProfile || loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <PageHeader title="Manage Users" showBack />
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <PageHeader title="Manage Users" showBack />

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>System Users ({users.length})</Text>

                {users.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyText}>No users found.</Text>
                    </View>
                ) : (
                    users.map(u => (
                        <View key={u.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <Text style={styles.profileName}>{(u as any).name}</Text>
                                    <Text style={styles.profileEmail}>{u.email}</Text>
                                </View>
                                <View style={[styles.roleBadge, (u as any).role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeSteward]}>
                                    <Text style={[styles.roleBadgeText, (u as any).role === 'admin' ? styles.roleBadgeTextAdmin : styles.roleBadgeTextSteward]}>
                                        {(u as any).role.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.actionsRow}>
                                {(u as any).role === 'steward' ? (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.promoteBtn]}
                                        onPress={() => handlePromote(u.id, (u as any).name)}
                                        disabled={actionLoading}
                                    >
                                        <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
                                        <Text style={styles.promoteBtnText}>Promote to Admin</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.demoteBtn]}
                                        onPress={() => handleDemote(u.id, (u as any).name)}
                                        disabled={actionLoading || u.id === user?.id}
                                    >
                                        <Ionicons name="shield-half-outline" size={16} color="#B91C1C" />
                                        <Text style={styles.demoteBtnText}>Demote to Steward</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    container: { flex: 1 },
    content: { padding: 24, paddingBottom: 60 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },

    emptyState: { alignItems: 'center', marginTop: 40, padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 16 },

    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    cardHeaderLeft: { flex: 1 },
    profileName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
    profileEmail: { fontSize: 14, color: '#6B7280' },

    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    roleBadgeSteward: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
    roleBadgeAdmin: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    roleBadgeText: { fontSize: 11, fontWeight: '800' },
    roleBadgeTextSteward: { color: '#6B7280' },
    roleBadgeTextAdmin: { color: '#B91C1C' },

    actionsRow: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
    promoteBtn: { backgroundColor: theme.colors.navy },
    promoteBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
    demoteBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5' },
    demoteBtnText: { color: '#B91C1C', fontWeight: '600', fontSize: 14 },
});
