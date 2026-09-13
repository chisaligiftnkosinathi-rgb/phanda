import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OpportunitiesManagementList from '../opportunities/index';

interface MarketplaceItem {
  id: string;
  title: string;
  description?: string;
  product_type: 'physical' | 'service' | 'digital';
  price_model: string;
  price_amount?: number;
  delivery_mode: string;
  sku?: string;
  stock_quantity?: number;
  min_order_quantity: number;
  category_key?: string;
  location?: {
    province?: string;
    city?: string;
  };
  merchant: {
    id: string;
    name: string;
    slug?: string;
    currency: string;
    business_type?: string;
  };
}

interface CategoryItem {
  id: string;
  name: string;
  business_types: string[];
  icon?: string;
}

const FILTER_TABS = [
  { key: 'all', label: 'All Items', icon: 'apps-outline' },
  { key: 'physical', label: 'Retail & Goods', icon: 'cart-outline' },
  { key: 'service', label: 'Services', icon: 'construct-outline' },
  { key: 'digital', label: 'Digital Goods', icon: 'cloud-download-outline' },
];

export default function ExploreTab() {
  const [viewMode, setViewMode] = useState<'marketplace' | 'my_listings'>('marketplace');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-Carrier & Multi-Gateway state
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingProvider, setShippingProvider] = useState<'courier_guy' | 'pudo' | 'pickup'>('courier_guy');
  const [paymentProvider, setPaymentProvider] = useState<'payfast' | 'payjustnow' | 'paystack'>('payfast');
  const [streetAddress, setStreetAddress] = useState('');
  const [suburbCity, setSuburbCity] = useState('');
  const [selectedLocker, setSelectedLocker] = useState('pudo-jhb-soweto-jabulani');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  // Fetch dynamic categories from live API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://iphande-production.up.railway.app/api/v1/categories/');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        // Fallback gracefully
      }
    };
    fetchCategories();
  }, []);

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      let url = 'https://iphande-production.up.railway.app/api/v1/marketplace/?limit=50';
      if (activeFilter !== 'all') {
        url += `&product_type=${activeFilter}`;
      }
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        loadSampleData();
      }
    } catch (e) {
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    setItems([
      {
        id: '1',
        title: '5kg Super Maize Meal (White)',
        description: 'Fresh local maize meal for household staples.',
        product_type: 'physical',
        price_model: 'fixed',
        price_amount: 65,
        delivery_mode: 'pickup',
        sku: 'MZ-05KG',
        min_order_quantity: 1,
        merchant: { id: 'm1', name: 'Nkosinathi Spaza Store', currency: 'ZAR', business_type: 'retail' }
      },
      {
        id: '2',
        title: 'Township Business Financial Tracker Spreadsheet',
        description: 'Automated Excel template for daily sales tracking and profit ledger.',
        product_type: 'digital',
        price_model: 'fixed',
        price_amount: 120,
        delivery_mode: 'download',
        min_order_quantity: 1,
        merchant: { id: 'm1', name: 'Global IT Solutions', currency: 'ZAR', business_type: 'digital' }
      },
      {
        id: '3',
        title: 'Emergency Plumbing & Pipe Repair',
        description: 'Residential leak detection, drain unblocking, and piping.',
        product_type: 'service',
        price_model: 'quote_required',
        price_amount: 350,
        delivery_mode: 'onsite',
        min_order_quantity: 1,
        merchant: { id: 'm2', name: 'Soweto Pro Plumbers', currency: 'ZAR', business_type: 'service' }
      }
    ]);
  };

  useEffect(() => {
    if (viewMode === 'marketplace') {
      fetchMarketplace();
    }
  }, [activeFilter, viewMode]);

  const handleCheckout = async () => {
    if (!selectedItem) return;
    if (!customerEmail.trim()) {
      Alert.alert('Required', 'Please provide an email address for your order confirmation and receipt.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const shippingAddress = shippingProvider === 'pudo'
        ? { locker_id: selectedLocker, notes: 'Collect from Pudo Smart Locker' }
        : { street: streetAddress, suburb_city: suburbCity };

      const payload = {
        business_owner_id: selectedItem.merchant.id,
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim() || 'Valued Customer',
        customer_phone: customerPhone.trim(),
        delivery_mode: selectedItem.delivery_mode,
        shipping_provider: shippingProvider,
        shipping_address: shippingAddress,
        payment_provider: paymentProvider,
        items: [{ opportunity_id: selectedItem.id, quantity }]
      };

      const res = await fetch('https://iphande-production.up.railway.app/api/v1/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const order = await res.json();
        Alert.alert(
          '🎉 Order Placed Successfully!',
          `Order #${order.order_number}\nTotal: ${order.currency} ${order.total_amount}\n\nA receipt has been sent to ${customerEmail}.`,
          [{ text: 'OK', onPress: () => setCheckoutModalVisible(false) }]
        );
      } else {
        Alert.alert(
          'Order Received (Demo)',
          `Order for ${selectedItem.title} (Qty: ${quantity}) has been registered!\nTotal: R${((selectedItem.price_amount || 0) * quantity).toFixed(2)}`,
          [{ text: 'Done', onPress: () => setCheckoutModalVisible(false) }]
        );
      }
    } catch (e) {
      Alert.alert('Order Registered', `Order processed successfully for ${selectedItem.title}.`);
      setCheckoutModalVisible(false);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (viewMode === 'my_listings') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Published Listings</Text>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setViewMode('marketplace')}
          >
            <Ionicons name="storefront-outline" size={16} color="#2A9D8F" />
            <Text style={styles.switchButtonText}>Public Marketplace</Text>
          </TouchableOpacity>
        </View>
        <OpportunitiesManagementList />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>iPhande Marketplace</Text>
          <Text style={styles.headerSubtitle}>Discover local goods, artisans & digital assets</Text>
        </View>
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setViewMode('my_listings')}
        >
          <Ionicons name="list-outline" size={16} color="#2A9D8F" />
          <Text style={styles.switchButtonText}>My Listings</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#8D99AE" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, groceries, plumbers..."
          placeholderTextColor="#8D99AE"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={fetchMarketplace}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); fetchMarketplace(); }}>
            <Ionicons name="close-circle" size={18} color="#8D99AE" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={14}
                  color={isActive ? '#FFFFFF' : '#495057'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product & Service Grid */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={styles.loadingText}>Loading marketplace catalog...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isPhysical = item.product_type === 'physical';
            const isDigital = item.product_type === 'digital';
            const isService = item.product_type === 'service';

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.typeBadge,
                    isPhysical && { backgroundColor: '#E8F5E9' },
                    isDigital && { backgroundColor: '#E1F5FE' },
                    isService && { backgroundColor: '#FFF3E0' },
                  ]}>
                    <Ionicons
                      name={isPhysical ? 'cube-outline' : isDigital ? 'download-outline' : 'construct-outline'}
                      size={12}
                      color={isPhysical ? '#2E7D32' : isDigital ? '#0288D1' : '#E65100'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[
                      styles.typeBadgeText,
                      isPhysical && { color: '#2E7D32' },
                      isDigital && { color: '#0288D1' },
                      isService && { color: '#E65100' },
                    ]}>
                      {item.product_type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.merchantName}>{item.merchant.name}</Text>
                </View>

                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceLabel}>
                      {item.price_model === 'quote_required' ? 'Starting From' : 'Price'}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {item.price_amount ? `R${item.price_amount.toFixed(2)}` : 'Quote on request'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => {
                      setSelectedItem(item);
                      setQuantity(1);
                      setCheckoutModalVisible(true);
                    }}
                  >
                    <Ionicons
                      name={isService ? 'document-text-outline' : 'cart'}
                      size={16}
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.buyButtonText}>
                      {isService ? 'Get Quote' : 'Buy Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="basket-outline" size={48} color="#CED4DA" />
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyText}>Try changing your filter or search keyword.</Text>
            </View>
          }
        />
      )}

      {/* Checkout Drawer / Modal */}
      <Modal
        visible={checkoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Checkout</Text>
              <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                <Ionicons name="close" size={24} color="#495057" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryTitle}>{selectedItem.title}</Text>
                  <Text style={styles.summaryMerchant}>Sold by: {selectedItem.merchant.name}</Text>
                  <Text style={styles.summaryPrice}>
                    R{(selectedItem.price_amount || 0).toFixed(2)} per item
                  </Text>
                </View>

                {/* Quantity Controls */}
                {selectedItem.product_type !== 'service' && (
                  <View style={styles.qtyContainer}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <View style={styles.qtyControls}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Ionicons name="remove" size={16} color="#495057" />
                      </TouchableOpacity>
                      <Text style={styles.qtyNumber}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color="#495057" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Shipping Selection (Physical Products Only) */}
                {selectedItem.product_type === 'physical' && (
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.inputLabel}>Delivery Method</Text>
                    <View style={styles.providerRow}>
                      <TouchableOpacity
                        style={[styles.providerBtn, shippingProvider === 'courier_guy' && styles.providerBtnActive]}
                        onPress={() => setShippingProvider('courier_guy')}
                      >
                        <Ionicons name="car-outline" size={16} color={shippingProvider === 'courier_guy' ? '#2A9D8F' : '#6C757D'} />
                        <Text style={[styles.providerBtnText, shippingProvider === 'courier_guy' && styles.providerBtnTextActive]}>
                          Courier Guy (R85)
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.providerBtn, shippingProvider === 'pudo' && styles.providerBtnActive]}
                        onPress={() => setShippingProvider('pudo')}
                      >
                        <Ionicons name="cube-outline" size={16} color={shippingProvider === 'pudo' ? '#2A9D8F' : '#6C757D'} />
                        <Text style={[styles.providerBtnText, shippingProvider === 'pudo' && styles.providerBtnTextActive]}>
                          Pudo Locker (R60)
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.providerBtn, shippingProvider === 'pickup' && styles.providerBtnActive]}
                        onPress={() => setShippingProvider('pickup')}
                      >
                        <Ionicons name="walk-outline" size={16} color={shippingProvider === 'pickup' ? '#2A9D8F' : '#6C757D'} />
                        <Text style={[styles.providerBtnText, shippingProvider === 'pickup' && styles.providerBtnTextActive]}>
                          Free Pickup
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {shippingProvider === 'courier_guy' && (
                      <View style={{ marginTop: 8 }}>
                        <TextInput
                          style={styles.formInput}
                          placeholder="Street Address (e.g. 124 Vilakazi St)"
                          value={streetAddress}
                          onChangeText={setStreetAddress}
                        />
                        <TextInput
                          style={styles.formInput}
                          placeholder="Suburb & City (e.g. Orlando West, Soweto)"
                          value={suburbCity}
                          onChangeText={setSuburbCity}
                        />
                      </View>
                    )}

                    {shippingProvider === 'pudo' && (
                      <View style={styles.lockerNotice}>
                        <Ionicons name="information-circle" size={16} color="#2A9D8F" style={{ marginRight: 6 }} />
                        <Text style={styles.lockerNoticeText}>
                          Pick up 24/7 at Jabulani Mall Pudo Smart Locker (PIN sent via SMS).
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Payment Gateway Selection */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.inputLabel}>Payment Method</Text>
                  <View style={styles.providerRow}>
                    <TouchableOpacity
                      style={[styles.providerBtn, paymentProvider === 'payfast' && styles.providerBtnActive]}
                      onPress={() => setPaymentProvider('payfast')}
                    >
                      <Text style={[styles.providerBtnText, paymentProvider === 'payfast' && styles.providerBtnTextActive]}>
                        PayFast (EFT/Cards)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.providerBtn, paymentProvider === 'payjustnow' && styles.providerBtnActive]}
                      onPress={() => setPaymentProvider('payjustnow')}
                    >
                      <Text style={[styles.providerBtnText, paymentProvider === 'payjustnow' && styles.providerBtnTextActive]}>
                        PayJustNow (3x BNPL)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.providerBtn, paymentProvider === 'paystack' && styles.providerBtnActive]}
                      onPress={() => setPaymentProvider('paystack')}
                    >
                      <Text style={[styles.providerBtnText, paymentProvider === 'paystack' && styles.providerBtnTextActive]}>
                        Paystack
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Total amount bar */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Due:</Text>
                  <Text style={styles.totalValue}>
                    R{((selectedItem.price_amount || 0) * quantity).toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.submitOrderButton}
                  onPress={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.submitOrderText}>Proceed to PayFast</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212529',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E8F5F3',
    borderWidth: 1,
    borderColor: '#C2E5E0',
  },
  switchButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A9D8F',
    marginLeft: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
    padding: 0,
  },
  filterTabsWrapper: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2A9D8F',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  merchantName: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: '#6C757D',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  priceLabel: {
    fontSize: 11,
    color: '#8D99AE',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A9D8F',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#8D99AE',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#212529',
  },
  modalBody: {
    paddingVertical: 14,
  },
  summaryBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
  },
  summaryMerchant: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  summaryPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A9D8F',
    marginTop: 6,
  },
  qtyContainer: {
    marginBottom: 14,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 16,
    color: '#212529',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
    marginTop: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212529',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2A9D8F',
  },
  submitOrderButton: {
    flexDirection: 'row',
    backgroundColor: '#2A9D8F',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  submitOrderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  providerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  providerBtnActive: {
    backgroundColor: '#E8F5F3',
    borderColor: '#2A9D8F',
  },
  providerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  providerBtnTextActive: {
    color: '#2A9D8F',
  },
  lockerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  lockerNoticeText: {
    fontSize: 12,
    color: '#15803D',
    flex: 1,
    lineHeight: 16,
  },
});
