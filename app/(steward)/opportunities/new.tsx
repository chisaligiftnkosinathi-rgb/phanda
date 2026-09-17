import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/features/auth';
import { useCreateOpportunity } from '@/features/opportunity';

const PRODUCT_CATEGORIES = [
  'Home & Living (Furniture/Crafts)',
  'Building & Hardware',
  'Fashion & Apparel',
  'Electronics & Solar',
  'Food, Catering & Agro',
  'General Merchandise',
];

const SERVICE_CATEGORIES = [
  'Carpentry & Woodwork',
  'Welding & Metalwork',
  'Plumbing & Electrical',
  'Building & Tiling',
  'Mechanics & Automotive',
  'Digital & Tech Services',
];

export default function NewOpportunityScreen() {
  const router = useRouter();
  const { identity, selectedBusiness } = useSession();
  const createMutation = useCreateOpportunity();

  // Mode: Physical Product vs Craftsman Service
  const [itemType, setItemType] = useState<'physical' | 'service'>('physical');

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [contactName, setContactName] = useState(selectedBusiness?.displayName || '');
  const [contactPhone, setContactPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Physical Product Specifics
  const [priceAmount, setPriceAmount] = useState('');
  const [stockQuantity, setStockQuantity] = useState('1');
  const [sku, setSku] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'shipping' | 'onsite'>('pickup');

  // Service Specifics
  const [priceModel, setPriceModel] = useState<'quote_required' | 'fixed'>('quote_required');
  const [hourlyOrFixedRate, setHourlyOrFixedRate] = useState('');

  const handleTypeChange = (type: 'physical' | 'service') => {
    setItemType(type);
    setCategory(type === 'physical' ? PRODUCT_CATEGORIES[0] : SERVICE_CATEGORIES[0]);
    if (type === 'service') {
      setDeliveryMode('onsite');
    } else {
      setDeliveryMode('pickup');
    }
  };

  const handleSubmit = async () => {
    if (!identity?.id) {
      Alert.alert('Authentication required', 'Please log in to add catalog items.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter an item or service title.');
      return;
    }

    if (itemType === 'physical' && !priceAmount.trim()) {
      Alert.alert('Price Required', 'Please set a price in ZAR for this product.');
      return;
    }

    const effectiveProfileId = selectedBusiness?.id || identity.id;

    try {
      const payload: any = {
        created_by_profile_id: effectiveProfileId,
        title: title.trim(),
        description: description.trim() || undefined,
        service_needed: itemType === 'physical' ? `Product: ${title}` : title,
        contact_name: contactName.trim() || selectedBusiness?.displayName || 'Merchant',
        contact_phone: contactPhone.trim() || '0000000000',
        category_key: category,
        province: 'Gauteng',
        town_or_city: 'Johannesburg',
        image_url_1: imageUrl.trim() || undefined,
        product_type: itemType,
        delivery_mode: deliveryMode,
        price_model: itemType === 'physical' ? 'fixed' : priceModel,
        price_amount: itemType === 'physical' ? parseFloat(priceAmount) : (priceModel === 'fixed' && hourlyOrFixedRate ? parseFloat(hourlyOrFixedRate) : undefined),
        stock_quantity: itemType === 'physical' ? parseFloat(stockQuantity || '1') : undefined,
        sku: sku.trim() || undefined,
      };

      const result = await createMutation.mutateAsync(payload);

      Alert.alert(
        'Success! 🎉',
        `${itemType === 'physical' ? 'Product' : 'Service'} published to your smart store!`,
        [
          {
            text: 'View in My Catalog',
            onPress: () => router.replace('/(steward)/opportunities'),
          },
          {
            text: 'View Public Store',
            onPress: () => {
              if (selectedBusiness?.slug) {
                router.push(`/(public)/public/${selectedBusiness.slug}` as any);
              } else {
                router.replace('/(steward)/opportunities');
              }
            },
          },
        ]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish item.';
      Alert.alert('Publish Error', msg);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Add to Your Store Catalog</Text>
      <Text style={styles.headerSubtitle}>
        Publish ready-to-buy physical products or advertise bookable craftsman services on your store slug.
      </Text>

      {/* Dual-Mode Selector */}
      <View style={styles.tabToggleRow}>
        <TouchableOpacity
          style={[styles.tabToggle, itemType === 'physical' && styles.tabToggleActive]}
          onPress={() => handleTypeChange('physical')}
        >
          <Ionicons
            name="cube"
            size={18}
            color={itemType === 'physical' ? '#0D9488' : '#64748B'}
          />
          <Text style={[styles.tabToggleText, itemType === 'physical' && styles.tabToggleTextActive]}>
            Physical Product
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabToggle, itemType === 'service' && styles.tabToggleActive]}
          onPress={() => handleTypeChange('service')}
        >
          <Ionicons
            name="hammer"
            size={18}
            color={itemType === 'service' ? '#0D9488' : '#64748B'}
          />
          <Text style={[styles.tabToggleText, itemType === 'service' && styles.tabToggleTextActive]}>
            Craftsman Service
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.label}>
          {itemType === 'physical' ? 'Product Name *' : 'Service Title *'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={itemType === 'physical' ? 'e.g. Handcrafted Oak Coffee Table' : 'e.g. Solar Inverter Installation'}
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {(itemType === 'physical' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pricing for Physical Product */}
        {itemType === 'physical' && (
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Price (ZAR) *</Text>
              <View style={styles.currencyInputWrap}>
                <Text style={styles.currencyPrefix}>R</Text>
                <TextInput
                  style={styles.currencyInput}
                  placeholder="1250.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={priceAmount}
                  onChangeText={setPriceAmount}
                />
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Stock Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={stockQuantity}
                onChangeText={setStockQuantity}
              />
            </View>
          </View>
        )}

        {/* Pricing for Craftsman Service */}
        {itemType === 'service' && (
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>Pricing Model</Text>
            <View style={styles.servicePriceOptions}>
              <TouchableOpacity
                style={[styles.servicePriceCard, priceModel === 'quote_required' && styles.servicePriceCardActive]}
                onPress={() => setPriceModel('quote_required')}
              >
                <Text style={[styles.servicePriceTitle, priceModel === 'quote_required' && styles.servicePriceTitleActive]}>
                  📋 Quote Required
                </Text>
                <Text style={styles.servicePriceDesc}>Client requests custom Dignity Quote</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.servicePriceCard, priceModel === 'fixed' && styles.servicePriceCardActive]}
                onPress={() => setPriceModel('fixed')}
              >
                <Text style={[styles.servicePriceTitle, priceModel === 'fixed' && styles.servicePriceTitleActive]}>
                  🏷️ Fixed Price
                </Text>
                <Text style={styles.servicePriceDesc}>Fixed consultation or call-out fee</Text>
              </TouchableOpacity>
            </View>

            {priceModel === 'fixed' && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>Fixed Fee (ZAR)</Text>
                <View style={styles.currencyInputWrap}>
                  <Text style={styles.currencyPrefix}>R</Text>
                  <TextInput
                    style={styles.currencyInput}
                    placeholder="450.00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={hourlyOrFixedRate}
                    onChangeText={setHourlyOrFixedRate}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Delivery / Fulfilment Mode */}
        <Text style={styles.label}>Delivery / Fulfillment Mode</Text>
        <View style={styles.deliveryRow}>
          {[
            { mode: 'pickup' as const, label: '🏬 Workshop Pickup' },
            { mode: 'shipping' as const, label: '🚚 Courier / Delivery' },
            { mode: 'onsite' as const, label: '🏡 Onsite at Client' },
          ].map((d) => (
            <TouchableOpacity
              key={d.mode}
              style={[styles.deliveryChip, deliveryMode === d.mode && styles.deliveryChipActive]}
              onPress={() => setDeliveryMode(d.mode)}
            >
              <Text style={[styles.deliveryChipText, deliveryMode === d.mode && styles.deliveryChipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Image URL */}
        <Text style={[styles.label, { marginTop: 14 }]}>Photo / Image URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://... (photo of item or previous work)"
          placeholderTextColor="#9ca3af"
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        {/* Description */}
        <Text style={styles.label}>Item Details & Description</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Dimensions, materials, guarantee, or service specifications..."
          placeholderTextColor="#9ca3af"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* SKU optional for physical goods */}
        {itemType === 'physical' && (
          <View>
            <Text style={styles.label}>SKU / Product Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. TBL-OAK-01"
              placeholderTextColor="#9ca3af"
              value={sku}
              onChangeText={setSku}
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitBtnText}>
            {itemType === 'physical' ? 'Publish Product to Store' : 'Publish Service to Store'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 16 },

  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  tabToggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabToggleText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabToggleTextActive: { color: '#0D9488', fontWeight: '700' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
  row: { flexDirection: 'row' },
  currencyInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  currencyPrefix: { fontSize: 16, fontWeight: '700', color: '#0D9488', marginRight: 6 },
  currencyInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#0F172A', fontWeight: '600' },

  chipRow: { flexDirection: 'row', marginBottom: 14 },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#0D9488' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },

  servicePriceOptions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  servicePriceCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  servicePriceCardActive: { borderColor: '#0D9488', backgroundColor: '#F0FDFA' },
  servicePriceTitle: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 2 },
  servicePriceTitleActive: { color: '#0D9488' },
  servicePriceDesc: { fontSize: 11, color: '#64748B' },

  deliveryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  deliveryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deliveryChipActive: { backgroundColor: '#F0FDFA', borderColor: '#0D9488' },
  deliveryChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  deliveryChipTextActive: { color: '#0D9488' },

  submitBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
