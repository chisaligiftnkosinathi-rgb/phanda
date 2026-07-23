import React from 'react';
import { ScrollView, View, StyleSheet, Text, Button, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/features/auth/hooks/useAuth';

export default function HomeTab() {
  const { identity, selectedBusiness, workspace } = useSession();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning, {identity?.displayName || identity?.email?.split('@')[0]}</Text>
          <View style={styles.businessNameRow}>
            <Text style={styles.businessName}>{selectedBusiness?.displayName || 'Your Business'}</Text>
            {selectedBusiness?.trust === 100 && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#2A9D8F" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Priority Card */}
        {workspace?.priority && (
          <View style={styles.priorityCard}>
            <Text style={styles.priorityTitle}>Today's Priority</Text>
            <Text style={styles.priorityText}>{workspace.priority}</Text>
            <Button title="Take Action" onPress={() => {}} />
          </View>
        )}

        {/* Business Snapshot */}
        {workspace?.snapshot && (
          <View style={styles.snapshotCard}>
            <Text style={styles.sectionTitle}>Business Snapshot</Text>
            <View style={styles.snapshotRow}>
              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Visibility</Text>
                <Text style={styles.snapshotValue}>{workspace.snapshot.visibility}</Text>
              </View>
              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Subscription</Text>
                <Text style={styles.snapshotValue}>{workspace.snapshot.subscription_plan}</Text>
              </View>
            </View>
            <View style={[styles.snapshotRow, { marginTop: 16 }]}>
              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Category</Text>
                <Text style={styles.snapshotValue}>{workspace.snapshot.category}</Text>
              </View>
              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Location</Text>
                <Text style={styles.snapshotValue}>{workspace.snapshot.location}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Today's Numbers */}
        {workspace?.summary && (
          <>
            <Text style={styles.sectionTitle}>Today's Numbers</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{workspace.summary.leads}</Text>
                <Text style={styles.statLabel}>Leads</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{workspace.summary.quotes}</Text>
                <Text style={styles.statLabel}>Quotes</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{workspace.summary.views}</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
            </View>
          </>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <View style={styles.actionBtn}><Button title="Post Service" onPress={() => {}} /></View>
          <View style={styles.actionBtn}><Button title="Create Quote" onPress={() => {}} /></View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 16, color: '#6c757d', marginBottom: 4 },
  businessNameRow: { flexDirection: 'row', alignItems: 'center' },
  businessName: { fontSize: 24, fontWeight: 'bold', color: '#212529', marginRight: 8 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f4ea', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 12, color: '#2A9D8F', marginLeft: 4, fontWeight: 'bold' },
  priorityCard: { backgroundColor: '#ffffff', marginBottom: 24, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  priorityTitle: { fontSize: 14, fontWeight: 'bold', color: '#e76f51', marginBottom: 8, textTransform: 'uppercase' },
  priorityText: { fontSize: 18, color: '#212529', marginBottom: 16 },
  priorityButton: { alignSelf: 'flex-start' },
  snapshotCard: { backgroundColor: '#ffffff', marginBottom: 24, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#212529', marginBottom: 16 },
  snapshotRow: { flexDirection: 'row', justifyContent: 'space-between' },
  snapshotItem: { flex: 1 },
  snapshotLabel: { fontSize: 14, color: '#6c757d', marginBottom: 4 },
  snapshotValue: { fontSize: 16, fontWeight: 'bold', color: '#212529' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { backgroundColor: '#ffffff', flex: 1, marginHorizontal: 4, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#2A9D8F', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#6c757d' },
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1 },
});
