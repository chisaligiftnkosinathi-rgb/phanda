export type ProductType = 'physical' | 'service' | 'digital';
export type PriceModel = 'fixed' | 'quote_required' | 'tiered' | 'subscription';
export type DeliveryMode = 'pickup' | 'shipping' | 'download' | 'onsite';

export interface CatalogItem {
  id: string;
  title: string;
  description?: string;
  category_key?: string;
  product_type: ProductType;
  price_model: PriceModel;
  price_amount?: number;
  delivery_mode: DeliveryMode;
  sku?: string;
  stock_quantity?: number;
  min_order_quantity?: number;
  image_url_1?: string;
  image_url_2?: string;
}

export interface StorefrontMerchant {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  categories: string[];
  currency: string;
  short_bio?: string;
  cover_photo_url?: string;
  logo_url?: string;
  province?: string;
  city?: string;
  operating_area?: string;
  address_label?: string;
  whatsapp_number?: string;
  business_line?: string;
  provider_type?: string;
  availability?: string;
  service_radius_km?: number;
  service_area_notes?: string;
  proof_of_work_items?: string;
  supporting_image_urls?: string;
  created_at?: string;
}

export interface StorefrontResponse {
  merchant: StorefrontMerchant;
  catalog: CatalogItem[];
}

export interface CartItem {
  item: CatalogItem;
  quantity: number;
}

export interface CheckoutPayload {
  business_owner_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_mode: DeliveryMode;
  shipping_provider?: string;
  shipping_address?: {
    street?: string;
    suburb?: string;
    city?: string;
    postal_code?: string;
    pudo_locker_id?: string;
  };
  payment_provider?: 'payfast' | 'payjustnow' | 'paystack';
  items: Array<{
    opportunity_id: string;
    quantity: number;
  }>;
}

export interface CheckoutResult {
  order_id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_url?: string;
  payfast_data?: Record<string, unknown>;
}

export interface OnboardStorePayload {
  name: string;
  slug: string;
  business_type: string;
  categories?: string[];
  business_line?: string;
  short_bio?: string;
  province?: string;
  city?: string;
  whatsapp_number?: string;
  bank_name?: string;
  account_holder_name?: string;
  account_number?: string;
  branch_code?: string;
  account_type?: string;
}

export interface OnboardStoreResult {
  status: string;
  profile_id: string;
  slug: string;
  name: string;
  store_url: string;
  payout_enabled: boolean;
}
