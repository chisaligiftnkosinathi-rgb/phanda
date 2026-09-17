import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    useMerchantStorefront,
    useCheckout,
    CatalogItem,
    CartItem,
    DeliveryMode,
    StorefrontMerchant,
} from '@/features/business';
import { useSubmitLead } from '@/features/lead';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = Math.min(SCREEN_WIDTH, 600);
const PAD = 20;
const GAP = 10;
const INNER = CONTENT_WIDTH - PAD * 2;
const HALF = (INNER - GAP) / 2;

// ─── TYPES & HELPERS ──────────────────────────────────────────────────────────

interface ProofOfWorkItem {
    url: string;
    title?: string;
    completed_date?: string;
    note?: string;
}

const clean = (v: unknown): string | null => {
    if (!v) return null;
    const s = String(v).trim();
    if (s === '' || s.toLowerCase() === 'none' || s === 'null') return null;
    return s;
};

const parseProofOfWorkItems = (
    powItemsJson: unknown,
    imageUrls: unknown
): ProofOfWorkItem[] => {
    const s = clean(powItemsJson);
    if (s) {
        try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return (parsed as ProofOfWorkItem[]).filter((x) => x?.url).slice(0, 8);
            }
        } catch { /* ignore */ }
    }
    const imgs = clean(imageUrls);
    if (imgs) {
        try {
            const parsed = JSON.parse(imgs);
            if (Array.isArray(parsed)) return (parsed as string[]).filter(Boolean).map(url => ({ url }));
        } catch {
            return imgs.split(',').map(u => u.trim()).filter(Boolean).map(url => ({ url }));
        }
    }
    return [];
};

const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const formatJoinDate = (isoStr: string | null | undefined): string => {
    if (!isoStr) return '';
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
    } catch {
        return '';
    }
};

const getAvailabilityDisplay = (
    val: string | null | undefined
): { label: string; color: string; icon: string } => {
    if (!val) return { label: 'Taking on new orders', color: '#2E7D32', icon: '✓' };
    const v = val.toLowerCase();
    if (v.includes('accept') || v.includes('available') || v.includes('open'))
        return { label: val, color: '#2E7D32', icon: '✓' };
    if (v.includes('busy') || v.includes('full') || v.includes('unavailable'))
        return { label: val, color: '#C62828', icon: '✗' };
    return { label: val, color: '#E65100', icon: '◷' };
};

// ─── MAIN STOREFRONT SCREEN ──────────────────────────────────────────────────

export default function SmartStorefrontScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();

    // Storefront Data Query
    const {
        data: storefrontData,
        isLoading,
        isError,
        error,
        refetch,
    } = useMerchantStorefront(slug as string, { enabled: !!slug });

    const merchant = storefrontData?.merchant;
    const catalog = useMemo(() => storefrontData?.catalog ?? [], [storefrontData?.catalog]);

    // Segmented Active Tab
    type TabKey = 'products' | 'services' | 'proof' | 'about';
    const [activeTab, setActiveTab] = useState<TabKey>('products');

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartVisible, setIsCartVisible] = useState(false);

    // Guest Checkout Form State
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('pickup');
    const [shippingStreet, setShippingStreet] = useState('');
    const [shippingSuburb, setShippingSuburb] = useState('');
    const [shippingCity, setShippingCity] = useState('');
    const [checkoutError, setCheckoutError] = useState('');
    const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

    const checkoutMutation = useCheckout();

    // Lead / Quote Request Modal State (for craftsman services)
    const [selectedService, setSelectedService] = useState<CatalogItem | null>(null);
    const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
    const [leadName, setLeadName] = useState('');
    const [leadPhone, setLeadPhone] = useState('');
    const [leadMessage, setLeadMessage] = useState('');
    const [quoteStatus, setQuoteStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [quoteErrorMsg, setQuoteErrorMsg] = useState('');

    const submitLeadMutation = useSubmitLead();

    // Derived Categorized Lists
    const physicalProducts = useMemo(
        () => catalog.filter((i) => i.product_type === 'physical' || i.product_type === 'digital'),
        [catalog]
    );
    const services = useMemo(
        () => catalog.filter((i) => i.product_type === 'service'),
        [catalog]
    );

    const proofItems = useMemo(
        () => parseProofOfWorkItems(merchant?.proof_of_work_items, merchant?.supporting_image_urls),
        [merchant?.proof_of_work_items, merchant?.supporting_image_urls]
    );

    // Cart calculations
    const cartItemCount = useMemo(
        () => cart.reduce((sum, item) => sum + item.quantity, 0),
        [cart]
    );
    const cartSubtotal = useMemo(
        () => cart.reduce((sum, ci) => sum + (Number(ci.item.price_amount) || 0) * ci.quantity, 0),
        [cart]
    );
    const shippingFee = deliveryMode === 'shipping' ? 85 : 0;
    const cartTotal = cartSubtotal + shippingFee;

    // Cart manipulation
    const handleAddToCart = (item: CatalogItem) => {
        setCart((prev) => {
            const existing = prev.find((ci) => ci.item.id === item.id);
            if (existing) {
                // check stock
                if (item.stock_quantity !== undefined && item.stock_quantity !== null && existing.quantity >= item.stock_quantity) {
                    Alert.alert('Maximum Stock Reached', `Only ${item.stock_quantity} available in stock.`);
                    return prev;
                }
                return prev.map((ci) =>
                    ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
                );
            }
            return [...prev, { item, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (itemId: string, delta: number) => {
        setCart((prev) => {
            return prev
                .map((ci) => {
                    if (ci.item.id !== itemId) return ci;
                    const newQty = ci.quantity + delta;
                    if (delta > 0 && ci.item.stock_quantity !== undefined && ci.item.stock_quantity !== null && newQty > ci.item.stock_quantity) {
                        Alert.alert('Stock Limit', `Only ${ci.item.stock_quantity} units available.`);
                        return ci;
                    }
                    return { ...ci, quantity: newQty };
                })
                .filter((ci) => ci.quantity > 0);
        });
    };

    const getItemQuantityInCart = (itemId: string): number => {
        const found = cart.find((ci) => ci.item.id === itemId);
        return found ? found.quantity : 0;
    };

    // Checkout Action
    const handleProceedToCheckout = async () => {
        if (!merchant) return;
        if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
            setCheckoutError('Please provide your name, email, and phone number.');
            return;
        }
        if (deliveryMode === 'shipping' && (!shippingStreet.trim() || !shippingCity.trim())) {
            setCheckoutError('Please provide your complete delivery address.');
            return;
        }

        setCheckoutError('');
        try {
            const res = await checkoutMutation.mutateAsync({
                business_owner_id: merchant.id,
                customer_name: customerName.trim(),
                customer_email: customerEmail.trim(),
                customer_phone: customerPhone.trim(),
                delivery_mode: deliveryMode,
                shipping_provider: deliveryMode === 'shipping' ? 'courier_guy' : 'pickup',
                shipping_address: deliveryMode === 'shipping' ? {
                    street: shippingStreet.trim(),
                    suburb: shippingSuburb.trim() || undefined,
                    city: shippingCity.trim(),
                } : undefined,
                payment_provider: 'payfast',
                items: cart.map((ci) => ({
                    opportunity_id: ci.item.id,
                    quantity: ci.quantity,
                })),
            });

            setConfirmedOrder(res);
            setCart([]); // Clear cart after successful checkout
        } catch (err: any) {
            setCheckoutError(err?.message || 'Failed to place order. Please check item stock.');
        }
    };

    // Service Quote / Lead Submission
    const handleOpenQuoteModal = (serviceItem?: CatalogItem) => {
        setSelectedService(serviceItem || null);
        setQuoteStatus('idle');
        setQuoteErrorMsg('');
        setIsQuoteModalVisible(true);
    };

    const handleSubmitQuote = async () => {
        if (!leadName.trim() || !leadPhone.trim()) {
            setQuoteErrorMsg('Please enter your name and phone number.');
            return;
        }

        setQuoteStatus('submitting');
        setQuoteErrorMsg('');
        try {
            await submitLeadMutation.mutateAsync({
                profile_slug: slug,
                name: leadName.trim(),
                phone: leadPhone.trim(),
                service_needed: selectedService ? selectedService.title : 'Custom Craftsman Service',
                message: leadMessage.trim() || undefined,
                source: 'public_profile' as any,
            });
            setQuoteStatus('success');
        } catch (err: any) {
            setQuoteStatus('error');
            setQuoteErrorMsg(err?.message || 'Could not send request. Please try again.');
        }
    };

    // External Sharing & Messaging
    const handleShareStore = async () => {
        if (!merchant) return;
        try {
            await Share.share({
                title: `${merchant.name} on Phanda`,
                message: `Check out ${merchant.name}'s shop on Phanda: https://phanda.app/public/${merchant.slug}`,
                url: `https://phanda.app/public/${merchant.slug}`,
            });
        } catch { /* ignore */ }
    };

    const handleWhatsApp = (customText?: string) => {
        if (!merchant || !merchant.whatsapp_number) return;
        const defaultText = `Hi ${merchant.name}, I visited your Phanda store and have an inquiry.`;
        const msg = encodeURIComponent(customText || defaultText);
        let phone = merchant.whatsapp_number.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) phone = '27' + phone.substring(1);
        Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
    };

    // Loading State
    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#1B4332" />
                <Text style={styles.loadingText}>Loading store…</Text>
            </View>
        );
    }

    // Error State
    if (isError || !merchant) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorEmoji}>🔍</Text>
                <Text style={styles.errorTitle}>Store Not Found</Text>
                <Text style={styles.errorSub}>
                    {(error as any)?.message || 'This merchant store could not be found or is inactive.'}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const avail = getAvailabilityDisplay(merchant.availability);
    const joinDate = formatJoinDate(merchant.created_at);

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* ── HERO BANNER ────────────────────────────────────────────── */}
                <View style={styles.heroContainer}>
                    {merchant.cover_photo_url ? (
                        <Image source={{ uri: merchant.cover_photo_url }} style={styles.heroImage} />
                    ) : (
                        <View style={[styles.heroImage, styles.heroPlaceholder]}>
                            <Text style={styles.heroPlaceholderText}>PHANDA STORE</Text>
                        </View>
                    )}
                </View>

                {/* ── STORE IDENTITY & HEADER ───────────────────────────────── */}
                <View style={styles.identityContainer}>
                    <View style={styles.avatarWrap}>
                        {merchant.logo_url ? (
                            <Image source={{ uri: merchant.logo_url }} style={styles.avatar} />
                        ) : (
                            <Text style={styles.avatarInitials}>
                                {merchant.name.substring(0, 2).toUpperCase()}
                            </Text>
                        )}
                    </View>

                    <Text style={styles.storeName}>{merchant.name}</Text>
                    <Text style={styles.storeSlug}>phanda.app/public/{merchant.slug}</Text>

                    {merchant.business_type ? (
                        <View style={styles.businessTypeBadge}>
                            <Text style={styles.businessTypeText}>
                                {merchant.business_type.toUpperCase()} • CERTIFIED STEWARD
                            </Text>
                        </View>
                    ) : null}

                    {merchant.city || merchant.province ? (
                        <Text style={styles.locationText}>
                            📍 {[merchant.city, merchant.province].filter(Boolean).join(', ')}
                        </Text>
                    ) : null}

                    {/* Action Bar */}
                    <View style={styles.actionBar}>
                        {merchant.whatsapp_number ? (
                            <TouchableOpacity
                                style={styles.whatsappBtn}
                                onPress={() => handleWhatsApp()}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.whatsappBtnText}>💬 WhatsApp Shop</Text>
                            </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                            style={styles.shareBtn}
                            onPress={handleShareStore}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.shareBtnText}>↗ Share Store</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── SEGMENTED NAVIGATION TABS ──────────────────────────────── */}
                <View style={styles.segmentedTabBar}>
                    <TouchableOpacity
                        style={[styles.segTab, activeTab === 'products' && styles.segTabActive]}
                        onPress={() => setActiveTab('products')}
                    >
                        <Text style={[styles.segTabText, activeTab === 'products' && styles.segTabTextActive]}>
                            🛍️ Products ({physicalProducts.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.segTab, activeTab === 'services' && styles.segTabActive]}
                        onPress={() => setActiveTab('services')}
                    >
                        <Text style={[styles.segTabText, activeTab === 'services' && styles.segTabTextActive]}>
                            🛠️ Services ({services.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.segTab, activeTab === 'proof' && styles.segTabActive]}
                        onPress={() => setActiveTab('proof')}
                    >
                        <Text style={[styles.segTabText, activeTab === 'proof' && styles.segTabTextActive]}>
                            📸 Proof ({proofItems.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.segTab, activeTab === 'about' && styles.segTabActive]}
                        onPress={() => setActiveTab('about')}
                    >
                        <Text style={[styles.segTabText, activeTab === 'about' && styles.segTabTextActive]}>
                            ℹ️ About
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── TAB CONTENT: PRODUCTS ─────────────────────────────────── */}
                {activeTab === 'products' && (
                    <View style={styles.tabSection}>
                        <View style={styles.sectionHeaderRow}>
                            <View>
                                <Text style={styles.sectionHeading}>Store Catalog</Text>
                                <Text style={styles.sectionSubheading}>
                                    Physical goods shipped directly or ready for workshop pickup.
                                </Text>
                            </View>
                        </View>

                        {physicalProducts.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyEmoji}>📦</Text>
                                <Text style={styles.emptyTitle}>No physical products right now</Text>
                                <Text style={styles.emptyText}>
                                    This store has not published physical inventory yet. Check out their custom craftsmanship services!
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyActionBtn}
                                    onPress={() => setActiveTab('services')}
                                >
                                    <Text style={styles.emptyActionBtnText}>View Services</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.productGrid}>
                                {physicalProducts.map((product) => {
                                    const inCartQty = getItemQuantityInCart(product.id);
                                    const isOutOfStock =
                                        product.stock_quantity !== undefined &&
                                        product.stock_quantity !== null &&
                                        product.stock_quantity <= 0;

                                    return (
                                        <View key={product.id} style={styles.productCard}>
                                            {product.image_url_1 ? (
                                                <Image
                                                    source={{ uri: product.image_url_1 }}
                                                    style={styles.productImage}
                                                />
                                            ) : (
                                                <View style={[styles.productImage, styles.productImagePlaceholder]}>
                                                    <Text style={styles.productPlaceholderIcon}>🛍️</Text>
                                                </View>
                                            )}

                                            <View style={styles.productBody}>
                                                <Text style={styles.productTitle} numberOfLines={2}>
                                                    {product.title}
                                                </Text>

                                                {product.description ? (
                                                    <Text style={styles.productDesc} numberOfLines={2}>
                                                        {product.description}
                                                    </Text>
                                                ) : null}

                                                {/* Stock & Delivery Badges */}
                                                <View style={styles.badgeRow}>
                                                    {isOutOfStock ? (
                                                        <View style={[styles.stockBadge, styles.stockBadgeOut]}>
                                                            <Text style={styles.stockBadgeOutText}>Out of stock</Text>
                                                        </View>
                                                    ) : product.stock_quantity !== undefined && product.stock_quantity !== null ? (
                                                        <View style={[styles.stockBadge, styles.stockBadgeIn]}>
                                                            <Text style={styles.stockBadgeInText}>
                                                                {product.stock_quantity <= 5
                                                                    ? `Only ${product.stock_quantity} left`
                                                                    : `${product.stock_quantity} In Stock`}
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <View style={[styles.stockBadge, styles.stockBadgeIn]}>
                                                            <Text style={styles.stockBadgeInText}>In Stock</Text>
                                                        </View>
                                                    )}

                                                    <View style={styles.deliveryBadge}>
                                                        <Text style={styles.deliveryBadgeText}>
                                                            {product.delivery_mode === 'pickup'
                                                                ? '🏬 Pickup'
                                                                : '🚚 Courier / Pickup'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View style={styles.productPriceRow}>
                                                    <Text style={styles.productPrice}>
                                                        R {Number(product.price_amount || 0).toFixed(2)}
                                                    </Text>

                                                    {/* Cart Controls */}
                                                    {inCartQty > 0 ? (
                                                        <View style={styles.qtyControlRow}>
                                                            <TouchableOpacity
                                                                style={styles.qtyBtn}
                                                                onPress={() => handleUpdateQuantity(product.id, -1)}
                                                            >
                                                                <Text style={styles.qtyBtnText}>−</Text>
                                                            </TouchableOpacity>
                                                            <Text style={styles.qtyDisplay}>{inCartQty}</Text>
                                                            <TouchableOpacity
                                                                style={styles.qtyBtn}
                                                                onPress={() => handleUpdateQuantity(product.id, 1)}
                                                            >
                                                                <Text style={styles.qtyBtnText}>+</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    ) : (
                                                        <TouchableOpacity
                                                            style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
                                                            onPress={() => handleAddToCart(product)}
                                                            disabled={isOutOfStock}
                                                        >
                                                            <Text style={styles.addBtnText}>
                                                                {isOutOfStock ? 'Sold Out' : '+ Add'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}

                {/* ── TAB CONTENT: CRAFTSMAN SERVICES ───────────────────────── */}
                {activeTab === 'services' && (
                    <View style={styles.tabSection}>
                        <View style={styles.sectionHeaderRow}>
                            <View>
                                <Text style={styles.sectionHeading}>Craftsman Services</Text>
                                <Text style={styles.sectionSubheading}>
                                    Book bespoke craftsmanship, consultations, and verified projects.
                                </Text>
                            </View>
                        </View>

                        {services.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyEmoji}>🛠️</Text>
                                <Text style={styles.emptyTitle}>Custom Requests Welcome</Text>
                                <Text style={styles.emptyText}>
                                    {merchant.name} provides tailored work. Request a dignity quote directly!
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyActionBtn}
                                    onPress={() => handleOpenQuoteModal()}
                                >
                                    <Text style={styles.emptyActionBtnText}>Request a Quote</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.servicesList}>
                                {services.map((service) => (
                                    <View key={service.id} style={styles.serviceCard}>
                                        <View style={styles.serviceHeader}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.serviceTitle}>{service.title}</Text>
                                                {service.description ? (
                                                    <Text style={styles.serviceDesc}>{service.description}</Text>
                                                ) : null}
                                            </View>
                                            <View style={styles.servicePriceBox}>
                                                {service.price_model === 'fixed' && service.price_amount ? (
                                                    <>
                                                        <Text style={styles.servicePriceFrom}>From</Text>
                                                        <Text style={styles.servicePriceVal}>
                                                            R {Number(service.price_amount).toFixed(2)}
                                                        </Text>
                                                    </>
                                                ) : (
                                                    <Text style={styles.serviceQuoteLabel}>Quote Req.</Text>
                                                )}
                                            </View>
                                        </View>

                                        <View style={styles.serviceFooterRow}>
                                            <Text style={styles.serviceFulfillment}>
                                                📍 {service.delivery_mode === 'onsite' ? 'On-site / Callout' : 'Workshop Visit'}
                                            </Text>

                                            <TouchableOpacity
                                                style={styles.serviceBookBtn}
                                                onPress={() => handleOpenQuoteModal(service)}
                                            >
                                                <Text style={styles.serviceBookBtnText}>Request Quote 📝</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* ── TAB CONTENT: PROOF OF WORK ────────────────────────────── */}
                {activeTab === 'proof' && (
                    <View style={styles.tabSection}>
                        <View style={styles.sectionHeaderRow}>
                            <View>
                                <Text style={styles.sectionHeading}>Verified Proof of Work</Text>
                                <Text style={styles.sectionSubheading}>
                                    Visual proof of previous jobs completed by this artisan.
                                </Text>
                            </View>
                        </View>

                        {proofItems.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyEmoji}>📸</Text>
                                <Text style={styles.emptyTitle}>Building Proof Portfolio</Text>
                                <Text style={styles.emptyText}>
                                    This steward has not uploaded work photos yet. Completed orders will appear here.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.proofGrid}>
                                {proofItems.map((item, idx) => (
                                    <View key={idx} style={styles.proofCard}>
                                        <Image source={{ uri: item.url }} style={styles.proofImage} />
                                        {(item.title || item.completed_date || item.note) ? (
                                            <View style={styles.proofMeta}>
                                                {item.title ? (
                                                    <Text style={styles.proofTitle}>{item.title}</Text>
                                                ) : null}
                                                {item.completed_date ? (
                                                    <Text style={styles.proofDate}>
                                                        Completed: {formatDate(item.completed_date)}
                                                    </Text>
                                                ) : null}
                                                {item.note ? (
                                                    <Text style={styles.proofNote}>{item.note}</Text>
                                                ) : null}
                                            </View>
                                        ) : null}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* ── TAB CONTENT: ABOUT ────────────────────────────────────── */}
                {activeTab === 'about' && (
                    <View style={styles.tabSection}>
                        {/* Story Card */}
                        <View style={styles.aboutCard}>
                            <Text style={styles.aboutCardTitle}>About the Merchant</Text>
                            <Text style={styles.aboutStory}>
                                {merchant.short_bio || `${merchant.name} is an active craftsman on Phanda.`}
                            </Text>
                        </View>

                        {/* Trust Metrics */}
                        <View style={styles.trustRow}>
                            <View style={styles.trustItem}>
                                <Text style={styles.trustValue}>🗓</Text>
                                <Text style={styles.trustTitle}>Joined Phanda</Text>
                                <Text style={styles.trustSub}>{joinDate || '2026'}</Text>
                            </View>

                            <View style={styles.trustItem}>
                                <Text style={styles.trustValue}>{proofItems.length}</Text>
                                <Text style={styles.trustTitle}>Verified Jobs</Text>
                                <Text style={styles.trustSub}>Uploaded proof</Text>
                            </View>

                            <View style={styles.trustItem}>
                                <Text style={styles.trustValue}>🇿🇦</Text>
                                <Text style={styles.trustTitle}>South Africa</Text>
                                <Text style={styles.trustSub}>{merchant.province || 'Local'}</Text>
                            </View>
                        </View>

                        {/* Operating Area */}
                        <View style={styles.aboutCard}>
                            <Text style={styles.aboutCardTitle}>Operating Location</Text>
                            <Text style={styles.aboutAddress}>
                                {[merchant.address_label, merchant.city, merchant.province].filter(Boolean).join(', ') ||
                                    'Location details provided upon order confirmation.'}
                            </Text>
                            {merchant.service_radius_km ? (
                                <Text style={styles.radiusText}>
                                    🌐 Servicing customers within {merchant.service_radius_km} km
                                </Text>
                            ) : null}
                            {merchant.service_area_notes ? (
                                <Text style={styles.notesText}>{merchant.service_area_notes}</Text>
                            ) : null}
                        </View>

                        {/* Status */}
                        <View style={[styles.statusCard, { borderColor: avail.color + '40' }]}>
                            <View style={[styles.statusDot, { backgroundColor: avail.color }]} />
                            <View>
                                <Text style={[styles.statusTitle, { color: avail.color }]}>
                                    {avail.icon} {avail.label}
                                </Text>
                                <Text style={styles.statusSub}>
                                    Store is active and responding to orders.
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* ── FLOATING CART BAR ─────────────────────────────────────────── */}
            {cartItemCount > 0 && (
                <View style={styles.floatingCartBar}>
                    <View>
                        <Text style={styles.floatingCartCount}>
                            🛒 {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                        </Text>
                        <Text style={styles.floatingCartTotal}>R {cartSubtotal.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.floatingCheckoutBtn}
                        onPress={() => {
                            setConfirmedOrder(null);
                            setIsCartVisible(true);
                        }}
                    >
                        <Text style={styles.floatingCheckoutBtnText}>Checkout →</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ── CART & CHECKOUT MODAL ─────────────────────────────────────── */}
            <Modal
                visible={isCartVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setIsCartVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        {confirmedOrder ? (
                            /* Order Confirmation View */
                            <View style={styles.orderConfirmedView}>
                                <Text style={styles.confirmedIcon}>🎉</Text>
                                <Text style={styles.confirmedTitle}>Order Confirmed!</Text>
                                <Text style={styles.confirmedOrderNum}>
                                    Order #{confirmedOrder.order_number || confirmedOrder.order_id?.substring(0, 8)}
                                </Text>
                                <Text style={styles.confirmedSub}>
                                    Stock has been reserved. Total: R {Number(confirmedOrder.total_amount || 0).toFixed(2)}
                                </Text>

                                <TouchableOpacity
                                    style={styles.whatsappOrderBtn}
                                    onPress={() => {
                                        const orderNum = confirmedOrder.order_number || confirmedOrder.order_id?.substring(0, 8);
                                        const msg = `Hi ${merchant.name}, I placed Order #${orderNum} on your Phanda store for R${Number(confirmedOrder.total_amount || 0).toFixed(2)}. Looking forward to receiving it!`;
                                        handleWhatsApp(msg);
                                    }}
                                >
                                    <Text style={styles.whatsappOrderBtnText}>
                                        💬 Notify Merchant on WhatsApp
                                    </Text>
                                </TouchableOpacity>

                                {confirmedOrder.payment_url ? (
                                    <TouchableOpacity
                                        style={styles.payOnlineBtn}
                                        onPress={() => Linking.openURL(confirmedOrder.payment_url)}
                                    >
                                        <Text style={styles.payOnlineBtnText}>💳 Complete Card / PayFast Payment</Text>
                                    </TouchableOpacity>
                                ) : null}

                                <TouchableOpacity
                                    style={styles.closeConfirmedBtn}
                                    onPress={() => setIsCartVisible(false)}
                                >
                                    <Text style={styles.closeConfirmedBtnText}>Back to Store</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* Active Cart View */
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Your Shopping Cart</Text>
                                    <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                                        <Text style={styles.modalCloseText}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Cart Items List */}
                                <View style={styles.cartItemsList}>
                                    {cart.map((ci) => (
                                        <View key={ci.item.id} style={styles.cartItemRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cartItemTitle}>{ci.item.title}</Text>
                                                <Text style={styles.cartItemPrice}>
                                                    R {Number(ci.item.price_amount || 0).toFixed(2)} each
                                                </Text>
                                            </View>

                                            <View style={styles.cartQtyRow}>
                                                <TouchableOpacity
                                                    style={styles.cartQtyBtn}
                                                    onPress={() => handleUpdateQuantity(ci.item.id, -1)}
                                                >
                                                    <Text style={styles.cartQtyBtnText}>−</Text>
                                                </TouchableOpacity>
                                                <Text style={styles.cartQtyText}>{ci.quantity}</Text>
                                                <TouchableOpacity
                                                    style={styles.cartQtyBtn}
                                                    onPress={() => handleUpdateQuantity(ci.item.id, 1)}
                                                >
                                                    <Text style={styles.cartQtyBtnText}>+</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Delivery Mode Selection */}
                                <Text style={styles.checkoutSectionHeading}>Select Delivery Method</Text>
                                <View style={styles.deliveryChoiceRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.deliveryOption,
                                            deliveryMode === 'pickup' && styles.deliveryOptionActive,
                                        ]}
                                        onPress={() => setDeliveryMode('pickup')}
                                    >
                                        <Text style={styles.deliveryOptionEmoji}>🏬</Text>
                                        <Text style={styles.deliveryOptionTitle}>Workshop Pickup</Text>
                                        <Text style={styles.deliveryOptionPrice}>FREE</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.deliveryOption,
                                            deliveryMode === 'shipping' && styles.deliveryOptionActive,
                                        ]}
                                        onPress={() => setDeliveryMode('shipping')}
                                    >
                                        <Text style={styles.deliveryOptionEmoji}>🚚</Text>
                                        <Text style={styles.deliveryOptionTitle}>Courier Guy</Text>
                                        <Text style={styles.deliveryOptionPrice}>+ R85.00</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Shipping Address (if courier selected) */}
                                {deliveryMode === 'shipping' && (
                                    <View style={styles.shippingInputsBox}>
                                        <Text style={styles.inputLabel}>Street Address *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={shippingStreet}
                                            onChangeText={setShippingStreet}
                                            placeholder="e.g. 14 Long Street"
                                            placeholderTextColor="#9CA3AF"
                                        />

                                        <View style={styles.addressSplitRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.inputLabel}>Suburb</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={shippingSuburb}
                                                    onChangeText={setShippingSuburb}
                                                    placeholder="e.g. Hatfield"
                                                    placeholderTextColor="#9CA3AF"
                                                />
                                            </View>
                                            <View style={{ width: 10 }} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.inputLabel}>City *</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={shippingCity}
                                                    onChangeText={setShippingCity}
                                                    placeholder="e.g. Pretoria"
                                                    placeholderTextColor="#9CA3AF"
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {/* Guest Buyer Info */}
                                <Text style={styles.checkoutSectionHeading}>Your Contact Details</Text>
                                <Text style={styles.inputLabel}>Full Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={customerName}
                                    onChangeText={setCustomerName}
                                    placeholder="Jane Doe"
                                    placeholderTextColor="#9CA3AF"
                                />

                                <Text style={styles.inputLabel}>WhatsApp / Mobile Phone *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={customerPhone}
                                    onChangeText={setCustomerPhone}
                                    placeholder="082 123 4567"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                />

                                <Text style={styles.inputLabel}>Email Address *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={customerEmail}
                                    onChangeText={setCustomerEmail}
                                    placeholder="jane@example.co.za"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                {/* Total Summary */}
                                <View style={styles.orderSummaryCard}>
                                    <View style={styles.summaryLine}>
                                        <Text style={styles.summaryLabel}>Subtotal</Text>
                                        <Text style={styles.summaryVal}>R {cartSubtotal.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.summaryLine}>
                                        <Text style={styles.summaryLabel}>Delivery</Text>
                                        <Text style={styles.summaryVal}>
                                            {deliveryMode === 'pickup' ? 'FREE' : 'R 85.00'}
                                        </Text>
                                    </View>
                                    <View style={[styles.summaryLine, styles.summaryTotalLine]}>
                                        <Text style={styles.summaryTotalLabel}>Total Due</Text>
                                        <Text style={styles.summaryTotalVal}>R {cartTotal.toFixed(2)}</Text>
                                    </View>
                                </View>

                                {checkoutError ? (
                                    <Text style={styles.checkoutErrorText}>{checkoutError}</Text>
                                ) : null}

                                <TouchableOpacity
                                    style={[
                                        styles.placeOrderBtn,
                                        checkoutMutation.isPending && styles.placeOrderBtnDisabled,
                                    ]}
                                    onPress={handleProceedToCheckout}
                                    disabled={checkoutMutation.isPending}
                                >
                                    {checkoutMutation.isPending ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.placeOrderBtnText}>
                                            Place Order (R {cartTotal.toFixed(2)})
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ── CRAFTSMAN SERVICE QUOTE MODAL ─────────────────────────────── */}
            <Modal
                visible={isQuoteModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setIsQuoteModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Request Dignity Quote</Text>
                            <TouchableOpacity onPress={() => setIsQuoteModalVisible(false)}>
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {quoteStatus === 'success' ? (
                            <View style={styles.orderConfirmedView}>
                                <Text style={styles.confirmedIcon}>✅</Text>
                                <Text style={styles.confirmedTitle}>Quote Request Sent!</Text>
                                <Text style={styles.confirmedSub}>
                                    {merchant.name} has received your request and will contact you via WhatsApp shortly.
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeConfirmedBtn}
                                    onPress={() => setIsQuoteModalVisible(false)}
                                >
                                    <Text style={styles.closeConfirmedBtnText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedService ? (
                                    <View style={styles.quoteSelectedCard}>
                                        <Text style={styles.quoteSelectedLabel}>SERVICE REQUESTED</Text>
                                        <Text style={styles.quoteSelectedTitle}>{selectedService.title}</Text>
                                    </View>
                                ) : null}

                                <Text style={styles.inputLabel}>Your Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={leadName}
                                    onChangeText={setLeadName}
                                    placeholder="e.g. Sipho Ndlovu"
                                    placeholderTextColor="#9CA3AF"
                                />

                                <Text style={styles.inputLabel}>WhatsApp / Phone Number *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={leadPhone}
                                    onChangeText={setLeadPhone}
                                    placeholder="082 123 4567"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                />

                                <Text style={styles.inputLabel}>Project Requirements / Message</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={leadMessage}
                                    onChangeText={setLeadMessage}
                                    placeholder="Please describe dimensions, preferred materials, or timeline…"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />

                                {quoteErrorMsg ? (
                                    <Text style={styles.checkoutErrorText}>{quoteErrorMsg}</Text>
                                ) : null}

                                <TouchableOpacity
                                    style={[
                                        styles.placeOrderBtn,
                                        quoteStatus === 'submitting' && styles.placeOrderBtnDisabled,
                                    ]}
                                    onPress={handleSubmitQuote}
                                    disabled={quoteStatus === 'submitting'}
                                >
                                    {quoteStatus === 'submitting' ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.placeOrderBtnText}>Submit Quote Request</Text>
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

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#F9F8F6' },
    container: { flex: 1 },
    content: { paddingBottom: 110, maxWidth: 600, alignSelf: 'center', width: '100%' },

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#F9F8F6',
    },
    loadingText: { marginTop: 14, fontSize: 16, color: '#4B5563', fontWeight: '500' },
    errorEmoji: { fontSize: 44, marginBottom: 12 },
    errorTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
    errorSub: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
    retryButton: { backgroundColor: '#1B4332', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    retryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

    // Hero
    heroContainer: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#E5E7EB' },
    heroImage: { width: '100%', height: '100%' },
    heroPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#D8F3DC' },
    heroPlaceholderText: { fontSize: 24, fontWeight: '900', color: '#2D6A4F', letterSpacing: 4 },

    // Identity
    identityContainer: {
        alignItems: 'center',
        marginTop: -55,
        paddingHorizontal: PAD,
        zIndex: 10,
    },
    avatarWrap: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#F9F8F6',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },
    avatar: { width: 102, height: 102, borderRadius: 51 },
    avatarInitials: { fontSize: 36, fontWeight: '900', color: '#1B4332' },
    storeName: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 12, textAlign: 'center' },
    storeSlug: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },
    businessTypeBadge: {
        marginTop: 8,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    businessTypeText: { fontSize: 11, fontWeight: '800', color: '#1B4332', letterSpacing: 0.6 },
    locationText: { fontSize: 14, color: '#4B5563', marginTop: 6 },

    // Action Bar
    actionBar: {
        flexDirection: 'row',
        marginTop: 18,
        gap: 12,
        width: '100%',
    },
    whatsappBtn: {
        flex: 1,
        backgroundColor: '#25D366',
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    whatsappBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
    shareBtn: {
        flex: 1,
        backgroundColor: '#111827',
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    shareBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

    // Segmented Tabs
    segmentedTabBar: {
        flexDirection: 'row',
        marginTop: 24,
        marginHorizontal: PAD,
        backgroundColor: '#ECEAE4',
        borderRadius: 14,
        padding: 4,
    },
    segTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    segTabActive: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    segTabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    segTabTextActive: { color: '#111827', fontWeight: '800' },

    // Tab Content Section
    tabSection: { marginTop: 24, paddingHorizontal: PAD },
    sectionHeaderRow: { marginBottom: 16 },
    sectionHeading: { fontSize: 18, fontWeight: '800', color: '#111827' },
    sectionSubheading: { fontSize: 13, color: '#6B7280', marginTop: 2 },

    // Product Grid
    productGrid: { gap: 16 },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    productImage: { width: '100%', height: 180, backgroundColor: '#F3F4F6' },
    productImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
    productPlaceholderIcon: { fontSize: 44 },
    productBody: { padding: 16 },
    productTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
    productDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 10 },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    stockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    stockBadgeIn: { backgroundColor: '#E8F5E9' },
    stockBadgeInText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },
    stockBadgeOut: { backgroundColor: '#FEE2E2' },
    stockBadgeOutText: { color: '#DC2626', fontSize: 11, fontWeight: '700' },
    deliveryBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    deliveryBadgeText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },

    productPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productPrice: { fontSize: 20, fontWeight: '900', color: '#1B4332' },
    addBtn: {
        backgroundColor: '#1B4332',
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 10,
    },
    addBtnDisabled: { backgroundColor: '#9CA3AF' },
    addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
    qtyControlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    qtyBtn: { paddingHorizontal: 12, paddingVertical: 7 },
    qtyBtnText: { fontSize: 16, fontWeight: '800', color: '#1B4332' },
    qtyDisplay: { fontSize: 14, fontWeight: '800', color: '#1B4332', paddingHorizontal: 4 },

    // Services List
    servicesList: { gap: 14 },
    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
    },
    serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
    serviceTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
    serviceDesc: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 },
    servicePriceBox: { alignItems: 'flex-end' },
    servicePriceFrom: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
    servicePriceVal: { fontSize: 16, fontWeight: '800', color: '#1B4332' },
    serviceQuoteLabel: { fontSize: 12, fontWeight: '700', color: '#D97706', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    serviceFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    serviceFulfillment: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    serviceBookBtn: {
        backgroundColor: '#111827',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    serviceBookBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

    // Proof Grid
    proofGrid: { gap: 14 },
    proofCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    proofImage: { width: '100%', height: 200, backgroundColor: '#F3F4F6' },
    proofMeta: { padding: 14 },
    proofTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
    proofDate: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
    proofNote: { fontSize: 13, color: '#4B5563', lineHeight: 18 },

    // About Section
    aboutCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 16,
    },
    aboutCardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 8 },
    aboutStory: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
    aboutAddress: { fontSize: 14, color: '#111827', lineHeight: 20 },
    radiusText: { fontSize: 13, color: '#2563EB', marginTop: 6, fontWeight: '600' },
    notesText: { fontSize: 13, color: '#6B7280', marginTop: 6 },

    trustRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    trustItem: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    trustValue: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 2 },
    trustTitle: { fontSize: 11, fontWeight: '700', color: '#4B5563', textAlign: 'center' },
    trustSub: { fontSize: 10, color: '#9CA3AF', marginTop: 2, textAlign: 'center' },

    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1.5,
    },
    statusDot: { width: 12, height: 12, borderRadius: 6 },
    statusTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
    statusSub: { fontSize: 12, color: '#6B7280' },

    // Empty States
    emptyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyEmoji: { fontSize: 40, marginBottom: 12 },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6 },
    emptyText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
    emptyActionBtn: { backgroundColor: '#1B4332', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
    emptyActionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

    // Floating Cart Bar
    floatingCartBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 560,
        alignSelf: 'center',
        backgroundColor: '#111827',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    floatingCartCount: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    floatingCartTotal: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
    floatingCheckoutBtn: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },
    floatingCheckoutBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

    // Modals
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        padding: 24,
        paddingBottom: 36,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
    modalCloseText: { fontSize: 20, fontWeight: '700', color: '#9CA3AF', padding: 4 },

    // Cart Modal internals
    cartItemsList: { gap: 12, marginBottom: 20 },
    cartItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    cartItemTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
    cartItemPrice: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    cartQtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8 },
    cartQtyBtn: { paddingHorizontal: 10, paddingVertical: 6 },
    cartQtyBtnText: { fontSize: 15, fontWeight: '700', color: '#111827' },
    cartQtyText: { paddingHorizontal: 8, fontSize: 13, fontWeight: '700', color: '#111827' },

    checkoutSectionHeading: { fontSize: 15, fontWeight: '800', color: '#111827', marginTop: 16, marginBottom: 10 },
    deliveryChoiceRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    deliveryOption: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    deliveryOptionActive: {
        borderColor: '#1B4332',
        backgroundColor: '#E8F5E9',
    },
    deliveryOptionEmoji: { fontSize: 22, marginBottom: 4 },
    deliveryOptionTitle: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'center' },
    deliveryOptionPrice: { fontSize: 12, fontWeight: '800', color: '#1B4332', marginTop: 4 },

    shippingInputsBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    addressSplitRow: { flexDirection: 'row' },

    inputLabel: { fontSize: 12, fontWeight: '700', color: '#4B5563', marginBottom: 4, marginTop: 10 },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 14,
        color: '#111827',
    },
    textArea: { height: 90, paddingTop: 10 },

    orderSummaryCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 14,
        marginTop: 20,
        marginBottom: 16,
    },
    summaryLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    summaryLabel: { fontSize: 13, color: '#6B7280' },
    summaryVal: { fontSize: 13, fontWeight: '700', color: '#111827' },
    summaryTotalLine: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
        marginTop: 4,
        marginBottom: 0,
    },
    summaryTotalLabel: { fontSize: 15, fontWeight: '800', color: '#111827' },
    summaryTotalVal: { fontSize: 17, fontWeight: '900', color: '#1B4332' },

    checkoutErrorText: { color: '#DC2626', fontSize: 13, fontWeight: '600', marginBottom: 12 },
    placeOrderBtn: {
        backgroundColor: '#1B4332',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    placeOrderBtnDisabled: { opacity: 0.6 },
    placeOrderBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

    // Order Confirmed View
    orderConfirmedView: { alignItems: 'center', paddingVertical: 24 },
    confirmedIcon: { fontSize: 44, marginBottom: 12 },
    confirmedTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
    confirmedOrderNum: { fontSize: 15, fontWeight: '700', color: '#1B4332', marginBottom: 8 },
    confirmedSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    whatsappOrderBtn: {
        backgroundColor: '#25D366',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    whatsappOrderBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
    payOnlineBtn: {
        backgroundColor: '#111827',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    payOnlineBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
    closeConfirmedBtn: { paddingVertical: 12 },
    closeConfirmedBtnText: { color: '#6B7280', fontWeight: '700', fontSize: 14 },

    // Quote Requested internals
    quoteSelectedCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 10,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    quoteSelectedLabel: { fontSize: 10, fontWeight: '800', color: '#2E7D32', letterSpacing: 0.5 },
    quoteSelectedTitle: { fontSize: 15, fontWeight: '800', color: '#1B4332', marginTop: 2 },
});