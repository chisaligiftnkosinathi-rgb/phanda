import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import StatsSaLocationPicker from '@/components/location/StatsSaLocationPicker';
import { useMarketplace } from '@/state/public/useMarketplace';
import { MarketplaceCard } from '@/components/marketplace/MarketplaceCard';
import { getArchetypeGroups } from '@/types/tradeArchetypeTree';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = Math.min(SCREEN_WIDTH, 800);
const PAD = 24;

interface ArchetypeGroup {
    key: string;
    label?: string;
    title?: string;
    name?: string;
}

const POLICY_BANNER: Record<string, { label: string; color: string } | null> = {
    NORMAL: null,
    THROTTLE: { label: 'High demand — updates may be slightly delayed', color: '#F59E0B' },
    RESTRICT: { label: 'System load high — showing reduced results', color: '#EF4444' },
    EMERGENCY_FREEZE: { label: 'System paused — please try again shortly', color: '#7F1D1D' },
};

export default function PublicGatewayScreen() {
    const {
        items,
        loading,
        selectedArchetype,
        location,
        setArchetypeFilter,
        setLocationFilter,
    } = useMarketplace('explore');

    // Mocks don't have policyLevel or error currently
    const policyLevel = 'NORMAL';
    const error = null;
    const selectedCategory = selectedArchetype;
    const setCategoryFilter = setArchetypeFilter;

    const filterArchetypes: ArchetypeGroup[] = getArchetypeGroups() || [];
    const policyBanner = POLICY_BANNER[policyLevel];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Explore the Marketplace</Text>
                
                {policyBanner && (
                    <View style={[styles.policyBanner, { backgroundColor: policyBanner.color }]}>
                        <Text style={styles.policyBannerText}>{policyBanner.label}</Text>
                    </View>
                )}

                <View style={styles.filtersContainer}>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedCategory}
                            onValueChange={setCategoryFilter}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Categories..." value="" color="#9EAD9B" />
                            {filterArchetypes.map((arch) => (
                                <Picker.Item 
                                    key={arch.key} 
                                    label={arch.label || arch.title || arch.name || arch.key} 
                                    value={arch.key} 
                                />
                            ))}
                        </Picker>
                    </View>

                    <View style={{ zIndex: 10 }}>
                        <StatsSaLocationPicker
                            value={location}
                            onChange={setLocationFilter}
                            placeholder="Search location..."
                        />
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    policyLevel === 'EMERGENCY_FREEZE' && styles.frozenContent
                ]}
            >
                <Text style={styles.sectionTitle}>Featured Opportunities &amp; People</Text>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#6366F1" />
                        <Text style={styles.loadingText}>Economy loading...</Text>
                    </View>
                )}

                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                {!loading && !error && items.map((item) => (
                    <MarketplaceCard key={item.identity.id} entity={item} />
                ))}

                {!loading && !error && items.length === 0 && (
                    <Text style={styles.emptyText}>No results in this area yet. Demand may emerge soon.</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { paddingBottom: 80, paddingHorizontal: PAD, maxWidth: CONTENT_WIDTH, alignSelf: 'center', width: '100%' },
    frozenContent: { opacity: 0.4 },

    header: { 
        backgroundColor: '#FFFFFF',
        paddingHorizontal: PAD,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: '#F3F4F6',
        zIndex: 100,
    },
    title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
    
    policyBanner: {
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    policyBannerText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

    filtersContainer: {
        marginTop: 8,
        gap: 12,
    },
    pickerContainer: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        overflow: 'hidden',
    },
    picker: { height: 50, color: '#111827' },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginVertical: 24 },

    loadingContainer: { alignItems: 'center', paddingTop: 40, gap: 12 },
    loadingText: { fontSize: 14, color: '#6B7280' },
    errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center', marginTop: 24 },
    emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 24, fontStyle: 'italic' },
});