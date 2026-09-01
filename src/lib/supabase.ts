import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { Product, Order, CartItem, Address } from '../types';

export const SUPABASE_URL: string = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://myyldlatjjyflafvvjzm.supabase.co';

export const SUPABASE_ANON_KEY: string = 
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  'sb_publishable_jRW0RVD42wxioPAozU0JXw_nsP2Mzd-';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseInstance;
  } catch (error) {
    console.warn('[Supabase] Failed to initialize client:', error);
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 10);
};

// Database interfaces matching Supabase tables
export interface DbProduct {
  id?: string;
  name: string;
  price: number;
  sale_price?: number | null;
  image_url?: string | null;
  youtube_video_link?: string | null;
  description?: string | null;
  category?: string | null;
  stock_quantity?: number | null;
  sku?: string | null;
  created_at?: string;
}

export interface DbStoreSetting {
  id?: string;
  setting_key: string;
  setting_value: string;
  updated_at?: string;
}

export interface DbOrder {
  id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address: string;
  pincode: string;
  items: any; // JSONB
  total_price: number;
  status: string;
  created_at?: string;
}

// Convert DB Product to App Product
export function mapDbProductToApp(db: DbProduct): Product {
  const images = db.image_url ? [db.image_url] : ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'];
  return {
    id: db.id || `prod-${Date.now()}`,
    name: db.name,
    sku: db.sku || `HAU-${Math.floor(1000 + Math.random() * 9000)}`,
    description: db.description || 'Curated Nordic Scandinavian design piece.',
    details: ['Crafted with sustainable materials', 'Handmade quality checks', 'Water-resistant treatment'],
    category: (db.category as any) || 'apparel',
    categoryTag: `#${db.category || 'lifestyle'}`,
    price: Number(db.sale_price || db.price),
    originalPrice: db.sale_price ? Number(db.price) : undefined,
    isSale: Boolean(db.sale_price && db.sale_price < db.price),
    rating: 4.9,
    reviewCount: 12,
    stockQuantity: db.stock_quantity ?? 15,
    isSoldOut: (db.stock_quantity ?? 15) <= 0,
    youtubeUrl: db.youtube_video_link || undefined,
    images: images,
    specifications: {
      dimensions: 'Standard Scandinavian fit',
      materials: 'Organic cotton and natural fibers',
      weight: '420g',
      origin: 'Copenhagen, Denmark',
      care: 'Spot clean only'
    },
    reviews: []
  };
}

export async function sendEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }
  try {
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin
      }
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send Email OTP.' };
  }
}

export async function verifyEmailOtp(email: string, token: string): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }
  try {
    const { data, error } = await client.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'email'
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Verification failed.' };
  }
}

export async function signUpWithPassword(email: string, password: string, name?: string): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }
  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name || '' }
      }
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sign up failed.' };
  }
}

export async function signInWithPassword(email: string, password: string): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sign in failed.' };
  }
}

export async function signInWithGoogle() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured. Please provide VITE_SUPABASE_ANON_KEY in settings.');
  }
  return await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
}

export async function signOutSupabase() {
  const client = getSupabaseClient();
  if (!client) return;
  return await client.auth.signOut();
}

// Data Fetching and Mutation API
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('[Supabase] fetchProducts error:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data.map(mapDbProductToApp);
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] fetchProducts exception:', err);
    return null;
  }
}

export async function insertProductToSupabase(product: Partial<Product> & { salePrice?: number }): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const dbPayload: DbProduct = {
      name: product.name || 'Untitled Product',
      price: product.originalPrice ? product.originalPrice : (product.price || 0),
      sale_price: product.originalPrice ? product.price : null,
      image_url: product.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
      youtube_video_link: product.youtubeUrl || null,
      description: product.description || '',
      category: product.category || 'accessories',
      stock_quantity: product.stockQuantity ?? 20,
      sku: product.sku || `HAU-${Math.floor(1000 + Math.random() * 9000)}`
    };

    const { error } = await client.from('products').insert([dbPayload]);
    if (error) {
      console.warn('[Supabase] insertProduct error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] insertProduct exception:', err);
    return false;
  }
}

export async function fetchStoreSettingsFromSupabase(): Promise<{ default_delivery_days?: number } | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('store_settings')
      .select('*')
      .eq('setting_key', 'default_delivery_days')
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] fetchStoreSettings error:', error.message);
      return null;
    }
    if (data && data.setting_value) {
      const days = parseInt(data.setting_value, 10);
      return { default_delivery_days: isNaN(days) ? 4 : days };
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] fetchStoreSettings exception:', err);
    return null;
  }
}

export async function updateStoreSettingsInSupabase(key: string, value: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('store_settings')
      .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });

    if (error) {
      console.warn('[Supabase] updateStoreSettings error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateStoreSettings exception:', err);
    return false;
  }
}

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] fetchOrders error:', error.message);
      return null;
    }
    if (data) {
      return data.map((d: DbOrder): Order => ({
        id: d.id || `ord-${Date.now()}`,
        orderNumber: d.id ? `HAU-${d.id.slice(0, 6).toUpperCase()}` : `HAU-${Math.floor(100000 + Math.random() * 900000)}`,
        date: d.created_at ? new Date(d.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        items: Array.isArray(d.items) ? d.items.map((i: any) => ({
          productId: i.productId || i.id || 'item',
          name: i.name || 'Haute Lifestyle Item',
          image: i.image || i.image_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
          price: i.price || 0,
          quantity: i.quantity || 1,
          selectedColor: i.selectedColor,
          selectedSize: i.selectedSize
        })) : [],
        subtotal: d.total_price * 0.92,
        shippingFee: 0,
        discount: 0,
        tax: d.total_price * 0.08,
        total: d.total_price,
        status: (d.status.toLowerCase() as any) || 'placed',
        shippingAddress: {
          id: 'addr-1',
          fullName: d.customer_name,
          phone: d.customer_phone || '',
          street: d.delivery_address,
          city: 'Customer City',
          state: 'State',
          pincode: d.pincode,
          country: 'Denmark',
          type: 'home'
        },
        paymentMethod: 'Credit Card / Supabase Checkout',
        paymentStatus: 'paid',
        trackingNumber: `DHL-${Math.floor(100000000 + Math.random() * 900000000)}`,
        carrier: 'DHL Nordic Express',
        estimatedDeliveryDate: new Date(Date.now() + 4 * 86400000).toLocaleDateString(),
        timeline: [
          {
            title: 'Order Confirmed',
            description: 'Order registered via Supabase OMS',
            timestamp: new Date().toLocaleTimeString(),
            location: 'Nordic Central Hub',
            completed: true,
            current: true
          }
        ]
      }));
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] fetchOrders exception:', err);
    return null;
  }
}

export async function insertOrderToSupabase(orderData: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address: string;
  pincode: string;
  items: CartItem[] | any[];
  total_price: number;
  status?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await client
      .from('orders')
      .insert([{
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone || '',
        delivery_address: orderData.delivery_address,
        pincode: orderData.pincode,
        items: orderData.items,
        total_price: orderData.total_price,
        status: orderData.status || 'Pending'
      }])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.[0]?.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function updateOrderStatusInSupabase(orderId: string, newStatus: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.warn('[Supabase] updateOrderStatus error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateOrderStatus exception:', err);
    return false;
  }
}
