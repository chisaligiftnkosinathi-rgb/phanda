import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PageHeader } from '@/components/PageHeader';
import { theme } from '@/config/theme';

interface DiscoveredTruth {
    id: string;
    claim: string;
    confidence: string;
}

interface ComplianceObligation {
    id: string;
    name: string;
    status: string;
    action: string;
}

const DISCOVERED_TRUTHS: DiscoveredTruth[] = [
    { id: '1', claim: 'Client requested assistance', confidence: 'High' },
    { id: '2', claim: 'Agreement reached (R1,500)', confidence: 'High' },
    { id: '3', claim: 'Deposit received (R1,000)', confidence: 'High' },
];

const COMPLIANCE_OBLIGATIONS: ComplianceObligation[] = [
    { id: 'c1', name: 'CIPC Active Status', status: 'UNKNOWN', action: 'Upload Certificate' },
    { id: 'c2', name: 'SARS Tax Clearance', status: 'UNKNOWN', action: 'Upload TCS PIN' },
];

export default function BusinessCaseDashboardScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <PageHeader
                eyebrow="AXIONYX Discovery"
                title="Discovered BusinessCase"
                subtitle="ID: BC-000001"
            />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reality Inventory (Knowns)</Text>
                {DISCOVERED_TRUTHS.map((truth) => (
                    <View key={truth.id} style={styles.truthRow}>
                        <Text style={styles.truthIcon}>✓</Text>
                        <View style={styles.truthContent}>
                            <Text style={styles.truthClaim}>{truth.claim}</Text>
                            <Text style={styles.confidenceText}>Confidence: {truth.confidence}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Compliance Context (Unknowns)</Text>
                <Text style={styles.infoText}>
                    Based on the discovered relationships, the following obligations apply:
                </Text>

                {COMPLIANCE_OBLIGATIONS.map((obl) => (
                    <View key={obl.id} style={styles.obligationCard}>
                        <Text style={styles.obligationName}>{obl.name}</Text>
                        <Text style={styles.obligationStatus}>Status: {obl.status}</Text>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>{obl.action}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        paddingBottom: 60,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        color: '#111827',
    },
    truthRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    truthIcon: {
        fontSize: 18,
        color: '#10B981',
        marginRight: 12,
        marginTop: 2,
    },
    truthContent: {
        flex: 1,
    },
    truthClaim: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    confidenceText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 16,
        lineHeight: 20,
    },
    obligationCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#F9FAFB',
    },
    obligationName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    obligationStatus: {
        fontSize: 13,
        color: '#D97706',
        fontWeight: '600',
        marginVertical: 8,
    },
    actionButton: {
        backgroundColor: theme.colors.navy,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
});
