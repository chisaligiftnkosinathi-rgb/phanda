import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import {
    useDashboardQuery,
    useRefreshDashboard,
    TrustCard,
    WalletCard,
    WorkCard,
    SystemCard
} from '@/features/dashboard';

export type ToolKey = 'quote_builder' | 'documents' | 'proof_of_work' | 'inventory_tracker' | 'km_tracker' | 'notebook' | 'referrals' | 'materials_calculator' | 'travel_calculator' | 'before_after_proof' | 'expense_tracker' | 'lead_tracker' | 'commission_calculator' | 'whatsapp_followup' | 'receipt_capture' | 'project_milestone_tracker' | 'document_generator' | 'vba_console';

const STEWARD_TOOL_REGISTRY: Record<string, { tools: ToolKey[] }> = {
    general: {
        tools: ['quote_builder', 'documents', 'proof_of_work', 'inventory_tracker', 'km_tracker', 'notebook']
    }
};

interface Tool {
    key: ToolKey;
    name: string;
    desc: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    route: string;
}

const ALL_TOOLS: Record<ToolKey, Tool> = {
    'quote_builder': { key: 'quote_builder', name: "Quote Builder", desc: "Prepare service quotes", icon: "calculator-outline", route: "/tools/calculator" },
    'documents': { key: 'documents', name: "Documents", desc: "Saved quotes & invoices", icon: "folder-open-outline", route: "/tools/documents" },
    'proof_of_work': { key: 'proof_of_work', name: "Proof of Work", desc: "Record completed work", icon: "checkmark-done-outline", route: "/tools/proof-of-work" },
    'inventory_tracker': { key: 'inventory_tracker', name: "Inventory", desc: "Track material costs", icon: "cube-outline", route: "/tools/inventory-tracker" },
    'km_tracker': { key: 'km_tracker', name: "Mileage Tracker", desc: "Log business travel km", icon: "car-outline", route: "/tools/km-tracker" },
    'notebook': { key: 'notebook', name: "Notebook", desc: "Record quick text notes", icon: "book-outline", route: "/tools/notebook" },
    'referrals': { key: 'referrals', name: "Referral Program", desc: "Invite stewards & earn ZAR", icon: "people-outline", route: "/tools/referrals" },
    'materials_calculator': { key: 'materials_calculator', name: "Materials", desc: "Calculate material costs", icon: "build-outline", route: "/tools/calculator" },
    'travel_calculator': { key: 'travel_calculator', name: "Travel", desc: "Calculate travel costs", icon: "map-outline", route: "/tools/km-tracker" },
    'before_after_proof': { key: 'before_after_proof', name: "Before/After Proof", desc: "Capture work progress", icon: "camera-reverse-outline", route: "/tools/proof-of-work" },
    'expense_tracker': { key: 'expense_tracker', name: "Expenses", desc: "Track business expenses", icon: "receipt-outline", route: "/tools/expenses" },
    'lead_tracker': { key: 'lead_tracker', name: "Lead Tracker", desc: "Manage customer leads", icon: "people-circle-outline", route: "/tabs/leads" },
    'commission_calculator': { key: 'commission_calculator', name: "Commission", desc: "Calculate sales commission", icon: "cash-outline", route: "/tools/calculator" },
    'whatsapp_followup': { key: 'whatsapp_followup', name: "WhatsApp Follow-up", desc: "Engage with customers", icon: "logo-whatsapp", route: "/tabs/leads" },
    'receipt_capture': { key: 'receipt_capture', name: "Receipt Capture", desc: "Scan and save receipts", icon: "receipt-outline", route: "/tools/expenses" },
    'project_milestone_tracker': { key: 'project_milestone_tracker', name: "Project Milestones", desc: "Track project progress", icon: "flag-outline", route: "/tools/milestones" },
    'document_generator': { key: 'document_generator', name: "Documents", desc: "Generate project documents", icon: "document-text-outline", route: "/tools/documents" },
    'vba_console': { key: 'vba_console', name: "VBA Console", desc: "Access Visual Business Automation", icon: "terminal-outline", route: "/tools/vba" },
};

export default function HomeScreen() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const isWide = width > 768;

    const { data: dashboard, isRefetching } = useDashboardQuery();
    const refreshDashboard = useRefreshDashboard();

    const isAdmin = dashboard?.businessContext?.permissions?.some(p => p.resource === 'system' && p.action === 'admin');
    const isCreator = dashboard?.businessContext?.permissions?.some(p => p.resource === 'platform' && p.action === 'owner');

    const isActivationApproved = dashboard?.businessContext?.status === "active";
    const isPaymentPending = dashboard?.businessContext?.status === "pending_payment" || dashboard?.businessContext?.status === "proof_uploaded";

    let activationStatusText = "Pending Activation";
    let activationStatusColor = "#D97706"; // Amber
    if (isActivationApproved || isAdmin || isCreator) {
        activationStatusText = "Active Profile";
        activationStatusColor = "#059669"; // Green
    } else if (!dashboard?.businessContext?.status || dashboard?.businessContext?.status === "created") {
        activationStatusText = "Awaiting Payment Proof";
        activationStatusColor = "#DC2626"; // Red
    }

    const toolSet = STEWARD_TOOL_REGISTRY['general'];
    const visibleTools = toolSet.tools.map(key => ALL_TOOLS[key]).filter(Boolean);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refreshDashboard} />}
        >
            <View style={styles.header}>
                <Text style={styles.kicker}>Home</Text>
                <Text style={styles.title}>{isCreator ? "System Creator" : "Today's Summary"}</Text>
                <Text style={styles.subtitle}>{isCreator ? "Platform management & owner console." : "Your business at a glance."}</Text>
                
                {/* State Indicator */}
                {dashboard?.trust.state === 'snapshot' && (
                    <Text style={{ fontSize: 12, color: '#D97706', marginTop: 8 }}>Viewing Offline Snapshot</Text>
                )}
            </View>

            {/* Profile Status Banner */}
            <View style={styles.section}>
                {isCreator ? (
                    <View style={[styles.statusBanner, { borderLeftColor: "#10B981" }]}>
                        <View style={styles.statusBannerContent}>
                            <Ionicons name="key" size={24} color="#10B981" />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={styles.statusTitle}>Platform Owner</Text>
                                <Text style={styles.statusDesc}>Global IT and Business Solutions</Text>
                                <Text style={[styles.statusDesc, { fontWeight: '700', color: '#111827', marginTop: 2 }]}>
                                    Full Access Enabled • Bootstrap Administration Active
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={[styles.statusBanner, { borderLeftColor: activationStatusColor }]}>
                        <View style={styles.statusBannerContent}>
                            <Ionicons
                                name={isActivationApproved ? "checkmark-circle" : "time"}
                                size={24}
                                color={activationStatusColor}
                            />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.statusTitle}>{activationStatusText}</Text>
                                {!isActivationApproved && (
                                    <Text style={styles.statusDesc}>
                                        {isPaymentPending
                                            ? "Your R120 payment proof is being reviewed."
                                            : "Please upload your R120 payment proof to activate your business profile."}
                                    </Text>
                                )}
                            </View>
                        </View>
                        {!isActivationApproved && !isPaymentPending && (
                            <Link href="/payment-verification" asChild>
                                <TouchableOpacity style={styles.uploadProofBtn}>
                                    <Text style={styles.uploadProofBtnText}>Upload Proof</Text>
                                </TouchableOpacity>
                            </Link>
                        )}
                    </View>
                )}
            </View>

            {/* Dashboard Widgets */}
            <View style={styles.section}>
                {(isAdmin || isCreator) && (
                    <TouchableOpacity
                        style={styles.adminPortalButton}
                        onPress={() => router.push('/admin' as any)}
                    >
                        <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                        <Text style={styles.adminPortalText}>Admin Portal</Text>
                        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                )}

                <Text style={styles.sectionTitle}>{isCreator ? "Platform Overview" : "My Business Today"}</Text>
                
                {dashboard && (
                    <View>
                        {(isAdmin || isCreator) && (
                            <SystemCard {...dashboard.system} />
                        )}
                        
                        <View style={styles.snapshotGrid}>
                            <TrustCard {...dashboard.trust} />
                            <WalletCard {...dashboard.wallet} />
                            <WorkCard {...dashboard.work} />
                        </View>
                    </View>
                )}
            </View>

            {/* Business Tools Grid */}
            <View style={styles.section}>
                <View style={styles.groupContainer}>
                    <Text style={styles.groupTitle}>Business Tools</Text>
                    <View style={[styles.grid, isWide && styles.gridWide]}>
                        {visibleTools.map((tool) => (
                            <Link key={tool.key} href={tool.route as any} asChild>
                                <TouchableOpacity style={StyleSheet.flatten([styles.toolCard, isWide && styles.toolCardWide])}>
                                    <Ionicons name={tool.icon as any} size={22} color="#6B7280" style={styles.toolIcon} />
                                    <View style={styles.toolTextContent}>
                                        <Text style={styles.toolTitle}>{tool.name}</Text>
                                        <Text style={styles.toolDescription}>{tool.desc}</Text>
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { padding: 24, paddingTop: 56, paddingBottom: 24, backgroundColor: '#F9FAFB' },
    kicker: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
    title: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
    section: { paddingHorizontal: 24, paddingBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
    statusBanner: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', borderLeftWidth: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    statusBannerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    statusTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    statusDesc: { fontSize: 13, color: '#4B5563', marginTop: 2 },
    uploadProofBtn: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 12 },
    uploadProofBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    adminPortalButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12 },
    adminPortalText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    snapshotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12, justifyContent: 'space-between' },
    groupContainer: { marginBottom: 36 },
    groupTitle: { fontSize: 14, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14, marginLeft: 4 },
    grid: { flexDirection: 'column', gap: 12 },
    gridWide: { flexDirection: 'row', flexWrap: 'wrap' },
    toolCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', minHeight: 84 },
    toolCardWide: { width: '48%' },
    toolIcon: { marginRight: 14 },
    toolTextContent: { flex: 1, justifyContent: 'center' },
    toolTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 2 },
    toolDescription: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
});
