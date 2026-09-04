import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { uploadToCloudinary } from './cloudinary';
import { Product, Order, Review, StoreCategory, FloatingBannerConfig } from '../types';

export interface FirestoreReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  title?: string;
  imageUrl?: string;
  avatar?: string;
  date: string;
  verified: boolean;
  approved?: boolean;
  helpfulCount: number;
}

export interface HomeBannerSettings {
  logoUrl?: string;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  discountBadge?: string;
  bannerLink?: string;
  eyewearImage?: string;
  eyewearTitle?: string;
  eyewearSubtitle?: string;
  editorialImage?: string;
  editorialTitle?: string;
  editorialSubtitle?: string;
  floatingBanner?: FloatingBannerConfig;
  updatedAt?: any;
}

/**
 * Uploads an image File or Blob to Cloudinary CDN and returns the secure HTTPS URL.
 */
export async function uploadMediaToCloudinary(
  file: File | Blob,
  onProgress?: (percent: number) => void
): Promise<string> {
  return await uploadToCloudinary(file, onProgress);
}

// -------------------------------------------------------------
// 1. PRODUCTS COLLECTION REAL-TIME SUBSCRIPTION & MUTATIONS
// -------------------------------------------------------------

/**
 * Subscribes to Real-Time Product Catalog updates from Cloud Firestore via onSnapshot.
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const productsRef = collection(db, 'products');
    return onSnapshot(
      productsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteProducts.push({
              id: docSnap.id,
              slug: data.slug || docSnap.id,
              name: data.name || 'Designer Item',
              tagline: data.tagline || '',
              description: data.description || '',
              details: data.details || data.features || [],
              category: data.category || 'accessories',
              categoryTag: data.categoryTag,
              price: Number(data.price) || 0,
              originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
              rating: Number(data.rating) || 5,
              reviewCount: Number(data.reviewCount) || 0,
              isSoldOut: Boolean(data.isSoldOut),
              isSale: Boolean(data.isSale),
              isNew: Boolean(data.isNew),
              isNewArrival: Boolean(data.isNewArrival),
              isFeatured: Boolean(data.isFeatured),
              isTrendingEyewear: Boolean(data.isTrendingEyewear),
              sku: data.sku || `SKU-${docSnap.id}`,
              stockQuantity: Number(data.stockQuantity) || 0,
              youtubeUrl: data.youtubeUrl || '',
              images: Array.isArray(data.images) && data.images.length > 0 ? data.images : (data.image ? [data.image] : []),
              colors: data.colors,
              sizes: data.sizes,
              customFont: data.customFont,
              customFontSize: data.customFontSize,
              buyNowButtonColor: data.buyNowButtonColor,
              displayRank: data.displayRank !== undefined ? Number(data.displayRank) : undefined,
              isBestSeller: Boolean(data.isBestSeller),
              deliveryDays: data.deliveryDays !== undefined ? Number(data.deliveryDays) : undefined,
              specifications: data.specifications || {
                dimensions: 'Standard Cut',
                materials: 'Bio-cellulose & Leather',
                weight: '350g',
                origin: 'Handmade in Oslo',
                care: 'Spot clean only'
              },
              recentPurchasesCount: data.recentPurchasesCount,
              returnPolicy: data.returnPolicy,
              reviews: data.reviews || []
            } as Product);
          });
          onUpdate(remoteProducts);
        }
      },
      (err) => {
        console.warn('Firestore products onSnapshot warning:', err);
        if (onError) onError(err);
      }
    );
  } catch (error: any) {
    console.warn('Failed to initialize Firestore onSnapshot:', error);
    return () => {};
  }
}

/**
 * Persists a new or modified product in Firestore 'products' collection.
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, {
      ...product,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
    throw error;
  }
}

/**
 * Deletes a product from Cloud Firestore.
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
    throw error;
  }
}

// -------------------------------------------------------------
// 2. DYNAMIC SITE BANNERS (settings/home_banner)
// -------------------------------------------------------------

/**
 * Subscribes to live hero banners and site announcement updates from Firestore doc 'settings/home_banner'.
 */
export function subscribeToHomeBanner(
  onUpdate: (bannerData: HomeBannerSettings) => void
): () => void {
  try {
    const bannerDocRef = doc(db, 'settings', 'home_banner');
    return onSnapshot(bannerDocRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as HomeBannerSettings);
      }
    }, (err) => console.warn('Firestore home_banner onSnapshot warning:', err));
  } catch {
    return () => {};
  }
}

/**
 * Saves hero banner and site announcement settings to Firestore doc 'settings/home_banner'.
 */
export async function saveHomeBannerToFirestore(bannerData: HomeBannerSettings): Promise<void> {
  try {
    const bannerDocRef = doc(db, 'settings', 'home_banner');
    await setDoc(bannerDocRef, {
      ...bannerData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving home banner to Firestore:', error);
    throw error;
  }
}

/**
 * Subscribes in real-time to floating announcement banner settings from Firestore doc 'settings/floating_banner'.
 */
export function subscribeToFloatingBanner(
  onUpdate: (banner: FloatingBannerConfig) => void
): () => void {
  try {
    const bannerDocRef = doc(db, 'settings', 'floating_banner');
    return onSnapshot(
      bannerDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onUpdate(data as FloatingBannerConfig);
        }
      },
      (err) => console.warn('Firestore floating_banner onSnapshot warning:', err)
    );
  } catch (error) {
    console.warn('subscribeToFloatingBanner failed to initialize:', error);
    return () => {};
  }
}

/**
 * Saves floating banner settings in real-time to Firestore doc 'settings/floating_banner'
 * and mirrors to 'settings/home_banner' for cross-system synchronization.
 */
export async function saveFloatingBannerToFirestore(bannerConfig: FloatingBannerConfig): Promise<void> {
  try {
    const bannerDocRef = doc(db, 'settings', 'floating_banner');
    const homeBannerRef = doc(db, 'settings', 'home_banner');

    await Promise.all([
      setDoc(
        bannerDocRef,
        {
          ...bannerConfig,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      ),
      setDoc(
        homeBannerRef,
        {
          floatingBanner: bannerConfig,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      )
    ]);
  } catch (error) {
    console.error('Error saving floating banner to Firestore:', error);
    throw error;
  }
}

// -------------------------------------------------------------
// 3. PRODUCT REVIEWS & TESTIMONIALS (reviews collection)
// -------------------------------------------------------------

/**
 * Subscribes in real-time to verified customer reviews in Firestore 'reviews' collection.
 */
export function subscribeToReviews(
  onUpdate: (reviews: FirestoreReview[]) => void
): () => void {
  try {
    const reviewsRef = collection(db, 'reviews');
    return onSnapshot(reviewsRef, (snapshot) => {
      const list: FirestoreReview[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        } as FirestoreReview);
      });
      onUpdate(list);
    }, (err) => console.warn('Reviews onSnapshot warning:', err));
  } catch {
    return () => {};
  }
}

/**
 * Saves a review to Firestore 'reviews' collection.
 */
export async function saveReviewToFirestore(review: FirestoreReview): Promise<void> {
  try {
    const docRef = doc(db, 'reviews', review.id);
    await setDoc(docRef, {
      ...review,
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving review to Firestore:', error);
    throw error;
  }
}

/**
 * Deletes a review from Firestore.
 */
export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting review from Firestore:', error);
    throw error;
  }
}

/**
 * Toggles approval status for a review in Firestore.
 */
export async function approveReviewInFirestore(reviewId: string, approved: boolean = true): Promise<void> {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    await setDoc(docRef, { approved }, { merge: true });
  } catch (error) {
    console.error('Error approving review in Firestore:', error);
    throw error;
  }
}

// -------------------------------------------------------------
// 4. ORDERS REAL-TIME SUBSCRIPTION & MUTATIONS
// -------------------------------------------------------------

/**
 * Saves a new order to Cloud Firestore 'orders' collection following the requested schema:
 * orderId, createdAt, status ("Pending"), items, totalAmount, customer, dispatchDate.
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const docRef = doc(db, 'orders', order.id);
    const orderData = {
      orderId: order.orderNumber || order.id,
      orderNumber: order.orderNumber || order.id,
      id: order.id,
      createdAt: serverTimestamp(),
      status: order.status || 'Pending',
      items: order.items.map((item) => ({
        title: item.title || item.name,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        imageUrl: item.imageUrl || item.image || '',
        image: item.image || item.imageUrl || '',
        productId: item.productId,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null
      })),
      totalAmount: Number(order.totalAmount || order.total || 0),
      total: Number(order.total || order.totalAmount || 0),
      customer: {
        fullName: order.customer?.fullName || order.shippingAddress?.fullName || order.customerName || 'Valued Client',
        email: order.customer?.email || order.email || 'customer@gmail.com',
        phone: order.customer?.phone || order.shippingAddress?.phone || '',
        addressLine1: order.customer?.addressLine1 || order.shippingAddress?.street || '',
        addressLine2: order.customer?.addressLine2 || order.shippingAddress?.apartment || '',
        city: order.customer?.city || order.shippingAddress?.city || '',
        state: order.customer?.state || order.shippingAddress?.state || '',
        postalCode: order.customer?.postalCode || order.shippingAddress?.pincode || ''
      },
      customerName: order.customer?.fullName || order.shippingAddress?.fullName || order.customerName || 'Valued Client',
      email: order.customer?.email || order.email || 'customer@gmail.com',
      dispatchDate: order.dispatchDate || null,
      subtotal: Number(order.subtotal || order.total || 0),
      shippingFee: Number(order.shippingFee || 0),
      discount: Number(order.discount || 0),
      tax: Number(order.tax || 0),
      shippingAddress: order.shippingAddress || {
        id: 'addr_1',
        fullName: order.customer?.fullName || 'Valued Client',
        phone: order.customer?.phone || '',
        street: order.customer?.addressLine1 || '',
        apartment: order.customer?.addressLine2 || '',
        city: order.customer?.city || '',
        state: order.customer?.state || '',
        pincode: order.customer?.postalCode || '',
        country: 'United States',
        type: 'home'
      },
      paymentMethod: order.paymentMethod || 'Credit Card',
      paymentStatus: order.paymentStatus || 'paid',
      trackingNumber: order.trackingNumber || `TRK-${Date.now().toString().slice(-8)}`,
      carrier: order.carrier || 'DHL Express Nordic',
      estimatedDeliveryDate: order.estimatedDeliveryDate || '3-5 Business Days',
      timeline: order.timeline || [],
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, orderData, { merge: true });
  } catch (error) {
    console.warn('Could not save order to Firestore:', error);
  }
}

/**
 * Subscribes to Orders in Real-Time via onSnapshot sorted by createdAt descending.
 */
export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void
): () => void {
  try {
    const ordersRef = collection(db, 'orders');
    return onSnapshot(ordersRef, (snapshot) => {
      if (!snapshot.empty) {
        const remoteOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const items = (d.items || []).map((it: any) => ({
            productId: it.productId || 'item-1',
            name: it.title || it.name || 'Product',
            title: it.title || it.name || 'Product',
            image: it.imageUrl || it.image || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
            imageUrl: it.imageUrl || it.image || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
            price: Number(it.price || 0),
            quantity: Number(it.quantity || 1),
            selectedColor: it.selectedColor,
            selectedSize: it.selectedSize
          }));

          const customer = d.customer || {
            fullName: d.shippingAddress?.fullName || d.customerName || 'Valued Client',
            email: d.email || 'customer@gmail.com',
            phone: d.shippingAddress?.phone || '+1 (555) 000-0000',
            addressLine1: d.shippingAddress?.street || '123 Main Street',
            addressLine2: d.shippingAddress?.apartment || '',
            city: d.shippingAddress?.city || 'City',
            state: d.shippingAddress?.state || 'State',
            postalCode: d.shippingAddress?.pincode || '00000'
          };

          const shippingAddress = d.shippingAddress || {
            id: 'addr-' + docSnap.id,
            fullName: customer.fullName,
            phone: customer.phone,
            street: customer.addressLine1,
            apartment: customer.addressLine2 || '',
            city: customer.city,
            state: customer.state,
            pincode: customer.postalCode,
            country: 'United States',
            type: 'home' as const,
            isDefault: true
          };

          remoteOrders.push({
            id: docSnap.id,
            orderId: d.orderId || d.orderNumber || docSnap.id,
            orderNumber: d.orderNumber || d.orderId || docSnap.id,
            date: d.date || (d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString()),
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            status: d.status || 'Pending',
            items: items,
            totalAmount: Number(d.totalAmount ?? d.total ?? 0),
            total: Number(d.total ?? d.totalAmount ?? 0),
            subtotal: Number(d.subtotal ?? d.total ?? 0),
            shippingFee: Number(d.shippingFee ?? 0),
            discount: Number(d.discount ?? 0),
            tax: Number(d.tax ?? 0),
            customer: customer,
            customerName: customer.fullName,
            email: customer.email,
            dispatchDate: d.dispatchDate || null,
            shippingAddress: shippingAddress,
            paymentMethod: d.paymentMethod || 'Credit Card',
            paymentStatus: d.paymentStatus || 'paid',
            trackingNumber: d.trackingNumber || `TRK-${docSnap.id.slice(-6)}`,
            carrier: d.carrier || 'DHL Express Nordic',
            estimatedDeliveryDate: d.estimatedDeliveryDate || '3-5 Business Days',
            timeline: d.timeline || []
          } as Order);
        });

        // Sort by createdAt descending
        remoteOrders.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });

        onUpdate(remoteOrders);
      }
    }, (err) => console.warn('Orders onSnapshot:', err));
  } catch {
    return () => {};
  }
}

/**
 * Updates an order status and planned dispatch date directly in Firestore using updateDoc.
 */
export async function updateFirestoreOrderStatus(
  orderId: string, 
  status: string, 
  dispatchDate?: string | null
): Promise<void> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const updates: Record<string, any> = {
      status,
      updatedAt: serverTimestamp()
    };
    if (dispatchDate !== undefined) {
      updates.dispatchDate = dispatchDate;
    }
    await updateDoc(docRef, updates);
  } catch (error) {
    try {
      const docRef = doc(db, 'orders', orderId);
      const updates: Record<string, any> = {
        status,
        updatedAt: serverTimestamp()
      };
      if (dispatchDate !== undefined) {
        updates.dispatchDate = dispatchDate;
      }
      await setDoc(docRef, updates, { merge: true });
    } catch (setErr) {
      console.error('Error updating order status in Firestore:', setErr);
      throw setErr;
    }
  }
}

/**
 * Customer Live Sync: Real-time listener for a single order document.
 */
export function subscribeToCustomerOrder(
  orderId: string,
  onUpdate: (order: Order | null) => void
): () => void {
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    return onSnapshot(orderDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        const items = (d.items || []).map((it: any) => ({
          productId: it.productId || 'item-1',
          name: it.title || it.name || 'Product',
          title: it.title || it.name || 'Product',
          image: it.imageUrl || it.image || '',
          imageUrl: it.imageUrl || it.image || '',
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          selectedColor: it.selectedColor,
          selectedSize: it.selectedSize
        }));

        const customer = d.customer || {
          fullName: d.shippingAddress?.fullName || d.customerName || 'Valued Client',
          email: d.email || 'customer@gmail.com',
          phone: d.shippingAddress?.phone || '',
          addressLine1: d.shippingAddress?.street || '',
          addressLine2: d.shippingAddress?.apartment || '',
          city: d.shippingAddress?.city || '',
          state: d.shippingAddress?.state || '',
          postalCode: d.shippingAddress?.pincode || ''
        };

        onUpdate({
          id: docSnap.id,
          orderId: d.orderId || d.orderNumber || docSnap.id,
          orderNumber: d.orderNumber || d.orderId || docSnap.id,
          date: d.date || new Date().toLocaleDateString(),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          status: d.status || 'Pending',
          items: items,
          totalAmount: Number(d.totalAmount ?? d.total ?? 0),
          total: Number(d.total ?? d.totalAmount ?? 0),
          subtotal: Number(d.subtotal ?? d.total ?? 0),
          shippingFee: Number(d.shippingFee ?? 0),
          discount: Number(d.discount ?? 0),
          tax: Number(d.tax ?? 0),
          customer: customer,
          customerName: customer.fullName,
          email: customer.email,
          dispatchDate: d.dispatchDate || null,
          shippingAddress: d.shippingAddress,
          paymentMethod: d.paymentMethod || 'Credit Card',
          paymentStatus: d.paymentStatus || 'paid',
          trackingNumber: d.trackingNumber || `TRK-${docSnap.id.slice(-6)}`,
          carrier: d.carrier || 'DHL Express Nordic',
          estimatedDeliveryDate: d.estimatedDeliveryDate || '3-5 Business Days',
          timeline: d.timeline || []
        } as Order);
      } else {
        onUpdate(null);
      }
    }, (err) => console.warn('Customer Order onSnapshot warning:', err));
  } catch {
    return () => {};
  }
}

// -------------------------------------------------------------
// 5. THEME & TYPOGRAPHY SETTINGS (settings/theme)
// -------------------------------------------------------------

export interface ThemeSettings {
  headingFont: string;
  productTitleFont: string;
  bodyFont: string;
  headingSizeScale: number;
  productTitleSizeScale: number;
  bodySizeScale: number;
  primaryColor: string;
  accentColor: string;
  colors?: Record<string, string>;
  buyNowButtonColor?: string;
  updatedAt?: any;
}

export const DEFAULT_CSS_COLOR_TOKENS: Record<string, string> = {
  'color-site-bg': '#faf9f6',
  'color-surface-card': '#ffffff',
  'color-header-bg': '#ffffff',
  'color-footer-bg': '#111827',
  'color-text-primary': '#111827',
  'color-text-secondary': '#6b7280',
  'color-text-muted': '#9ca3af',
  'color-footer-text': '#e5e7eb',
  'color-brand-primary': '#111827',
  'color-brand-accent': '#c5a880',
  'color-btn-bg': '#111827',
  'color-btn-text': '#ffffff',
  'color-btn-hover': '#27272a',
  'color-buynow-bg': '#DC2626',
  'color-buynow-text': '#ffffff',
  'color-buynow-hover': '#B91C1C',
  'color-border-subtle': '#e5e7eb',
  'color-badge-bg': '#f3f4f6',
  'color-badge-text': '#1f2937'
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  headingFont: "'Playfair Display', serif",
  productTitleFont: "'Cormorant Garamond', serif",
  bodyFont: "'Plus Jakarta Sans', sans-serif",
  headingSizeScale: 1.0,
  productTitleSizeScale: 1.0,
  bodySizeScale: 1.0,
  primaryColor: '#0f172a',
  accentColor: '#c5a880',
  colors: DEFAULT_CSS_COLOR_TOKENS,
  buyNowButtonColor: '#DC2626'
};

/**
 * Subscribes to Theme and Typography Settings in Real-Time via onSnapshot.
 */
export function subscribeToThemeSettings(
  onUpdate: (theme: ThemeSettings) => void
): () => void {
  try {
    const docRef = doc(db, 'settings', 'theme');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const d = snap.data() as ThemeSettings;
          onUpdate(d);
        }
      },
      (err) => console.warn('Theme settings onSnapshot:', err)
    );
  } catch {
    return () => {};
  }
}

/**
 * Saves Theme and Typography Settings to Firestore doc(db, "settings", "theme").
 */
export async function saveThemeSettingsToFirestore(theme: Partial<ThemeSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'theme');
    await setDoc(
      docRef,
      {
        ...theme,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving theme settings to Firestore:', error);
    throw error;
  }
}

// -------------------------------------------------------------
// 6. CATEGORIES REAL-TIME FIRESTORE SUBSCRIPTION & MUTATIONS
// -------------------------------------------------------------

export const DEFAULT_CATEGORIES: StoreCategory[] = [
  {
    id: 'backpack',
    key: 'backpack',
    name: 'Backpacks & Travel Bags',
    description: 'Technical canvas and vegetable-tanned Scandinavian leather backpacks',
    quote: 'Handcrafted utilitarian daypacks engineered for high-durability transit.',
    tagline: 'Technical canvas and vegetable-tanned Scandinavian leather backpacks',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
    badgeText: 'Featured on Home',
    featured: true,
    orderIndex: 1
  },
  {
    id: 'shoes',
    key: 'shoes',
    name: 'Footwear & Boots',
    description: 'Hand-welted Italian leather oxfords, Chelsea boots, and trainers',
    quote: 'Orthopedic comfort footbeds with Vibram high-traction outsoles.',
    tagline: 'Hand-welted Italian leather oxfords, Chelsea boots, and trainers',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    badgeText: 'Featured on Home',
    featured: true,
    orderIndex: 2
  },
  {
    id: 'glasses',
    key: 'glasses',
    name: 'Eyewear & Bio-Optics',
    description: 'Handmade Japanese titanium hinge frames and bio-cellulose acetate sunglasses',
    quote: 'UV400 polarized optics precision cut in Sabae, Japan.',
    tagline: 'Handmade Japanese titanium hinge frames and bio-cellulose acetate sunglasses',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
    badgeText: 'Featured on Home',
    featured: true,
    orderIndex: 3
  },
  {
    id: 'hats',
    key: 'hats',
    name: 'Headwear & Berets',
    description: '100% Merino wool knit beanies, felt fedoras, and architectural berets',
    quote: 'Thermal regulating fibers harvested from ethical Swedish pastures.',
    tagline: '100% Merino wool knit beanies, felt fedoras, and architectural berets',
    imageUrl: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=1000&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=1000&auto=format&fit=crop',
    badgeText: 'HATS',
    featured: true,
    orderIndex: 4
  },
  {
    id: 'apparel',
    key: 'apparel',
    name: 'Apparel & Outerwear',
    description: 'Silk georgette trench coats, structured blazers, and organic knitwear',
    quote: 'Bespoke tailoring with sustainable zero-waste atelier practices.',
    tagline: 'Silk georgette trench coats, structured blazers, and organic knitwear',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    badgeText: 'APPAREL',
    featured: true,
    orderIndex: 5
  },
  {
    id: 'accessories',
    key: 'accessories',
    name: 'Accessories & Knitwear',
    description: 'Merino scarves, full-grain cardholders, and silk scarves',
    quote: 'The finishing touches of enduring Nordic craftsmanship.',
    tagline: 'Merino scarves, full-grain cardholders, and silk scarves',
    imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=1000&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=1000&auto=format&fit=crop',
    badgeText: 'ACCESSORIES',
    featured: false,
    orderIndex: 6
  }
];

/**
 * Subscribes to Categories in Real-Time via onSnapshot from 'categories' collection.
 */
export function subscribeToCategories(
  onUpdate: (categories: StoreCategory[]) => void
): () => void {
  try {
    const categoriesRef = collection(db, 'categories');
    return onSnapshot(
      categoriesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: StoreCategory[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            list.push({
              id: docSnap.id,
              key: d.key || docSnap.id,
              name: d.name || 'Category',
              description: d.description || '',
              quote: d.quote || d.tagline || '',
              tagline: d.tagline || d.quote || '',
              imageUrl: d.imageUrl || d.image || '',
              image: d.imageUrl || d.image || '',
              badgeText: d.badgeText || (d.featured ? 'Featured on Home' : (d.key?.toUpperCase() || 'CATEGORY')),
              featured: d.featured !== undefined ? Boolean(d.featured) : true,
              orderIndex: Number(d.orderIndex || 1),
              updatedAt: d.updatedAt
            });
          });
          // Sort by orderIndex ascending
          list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
          onUpdate(list);
        } else {
          // Initialize Firestore with default categories if empty
          DEFAULT_CATEGORIES.forEach((cat) => {
            saveCategoryToFirestore(cat).catch(() => {});
          });
          onUpdate(DEFAULT_CATEGORIES);
        }
      },
      (err) => {
        console.warn('Categories onSnapshot error:', err);
        onUpdate(DEFAULT_CATEGORIES);
      }
    );
  } catch {
    onUpdate(DEFAULT_CATEGORIES);
    return () => {};
  }
}

/**
 * Saves or updates a category in Cloud Firestore 'categories' collection.
 */
export async function saveCategoryToFirestore(category: Partial<StoreCategory> & { id: string }): Promise<void> {
  try {
    const docRef = doc(db, 'categories', category.id);
    const dataToSave = {
      name: category.name || '',
      description: category.description || '',
      quote: category.quote || category.tagline || '',
      tagline: category.tagline || category.quote || '',
      imageUrl: category.imageUrl || category.image || '',
      image: category.imageUrl || category.image || '',
      badgeText: category.badgeText || (category.featured ? 'Featured on Home' : 'CATEGORY'),
      featured: category.featured !== undefined ? Boolean(category.featured) : false,
      orderIndex: Number(category.orderIndex || 1),
      key: category.key || category.id,
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    console.error('Error saving category to Firestore:', error);
    throw error;
  }
}

/**
 * Updates specific fields of a category in Cloud Firestore using updateDoc.
 */
export async function updateFirestoreCategory(
  categoryId: string, 
  updates: Partial<StoreCategory>
): Promise<void> {
  try {
    const docRef = doc(db, 'categories', categoryId);
    const data: Record<string, any> = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    if (updates.imageUrl) data.image = updates.imageUrl;
    if (updates.image && !updates.imageUrl) data.imageUrl = updates.image;
    if (updates.quote) data.tagline = updates.quote;

    await updateDoc(docRef, data);
  } catch {
    // Fallback to setDoc with merge if doc does not exist
    const docRef = doc(db, 'categories', categoryId);
    const data: Record<string, any> = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    if (updates.imageUrl) data.image = updates.imageUrl;
    if (updates.image && !updates.imageUrl) data.imageUrl = updates.image;
    if (updates.quote) data.tagline = updates.quote;

    await setDoc(docRef, data, { merge: true });
  }
}

// -------------------------------------------------------------
// 10. REAL-TIME DELIVERY SETTINGS (settings/delivery)
// -------------------------------------------------------------

export interface DeliverySettings {
  standardDeliveryDays: number;
  onlineDiscountPercent?: number;
  updatedAt?: any;
}

/**
 * Subscribes to live delivery settings and courier timeframe from Firestore doc 'settings/delivery'.
 */
export function subscribeToDeliverySettings(
  onUpdate: (data: DeliverySettings) => void
): () => void {
  try {
    const docRef = doc(db, 'settings', 'delivery');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as DeliverySettings);
      }
    }, (err) => console.warn('Firestore delivery onSnapshot warning:', err));
  } catch {
    return () => {};
  }
}

/**
 * Persists updated delivery timeframe and courier days to Firestore 'settings/delivery'.
 */
export async function saveDeliverySettingsToFirestore(
  settings: Partial<DeliverySettings>
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'delivery');
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving delivery settings to Firestore:', err);
    throw err;
  }
}

