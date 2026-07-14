import { Dimensions, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useMarketplace } from '@/state/public/useMarketplace';
import { MarketplaceCard } from '@/components/marketplace/MarketplaceCard';
import { IntentWizard } from '@/components/marketplace/IntentWizard';
import { getArchetypeGroups } from '@/types/tradeArchetypeTree';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = Math.min(SCREEN_WIDTH, 800);
const PAD = 24;

export default function PeopleLoopScreen() {
    const router = useRouter();
    const {
        items,
        setArchetypeFilter,
        setLocationFilter,
    } = useMarketplace("find-people");

    // Convert Archetype groups into the wizard's category format
    const categories = getArchetypeGroups().map(a => ({
        id: a.key,
        label: a.label || a.title || (a as any).name || 'Category'
    }));

    const resultsView = (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')}>
                    <Text style={styles.brandTitle}>phanda</Text>
                </TouchableOpacity>
                <View style={styles.activeFilters}>
                    <Text style={styles.filterText}>Refined by your choices</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {items.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No people found nearby.</Text>
                    </View>
                ) : (
                    items.map((item) => (
                        <MarketplaceCard key={item.identity.id} entity={item} />
                    ))
                )}
            </ScrollView>
        </View>
    );

    return (
        <IntentWizard
            titleStep1="What do you need help with?"
            categories={categories}
            onComplete={(category, location) => {
                setArchetypeFilter(category);
                setLocationFilter(location);
            }}
            resultsView={resultsView}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { paddingBottom: 80, paddingHorizontal: PAD, maxWidth: CONTENT_WIDTH, alignSelf: 'center', width: '100%' },

    header: { 
        backgroundColor: '#FFFFFF',
        paddingHorizontal: PAD,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: '#F3F4F6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandTitle: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
    
    activeFilters: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
    },

    emptyState: { padding: 24, alignItems: 'center' },
    emptyText: { color: '#6B7280', fontSize: 16 },
});
