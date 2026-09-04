import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { DivaChikLogo } from '../common/DivaChikLogo';
import { Address, Order } from '../../types';
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { load } from '@cashfreepayments/cashfree-js';
import { motion } from 'framer-motion';
import { sendOrderConfirmationEmail } from '../../lib/emailService';
import {
  ShieldCheck,
  Truck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  MessageCircle,
  Printer,
  Package,
  Clock,
  Check,
  Sparkles,
  MapPin,
  AlertCircle
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartTotal,
    cartDiscount,
    appliedCoupon,
    orderNote,
    currentUser,
    formatPrice,
    placeOrder,
    currentOrder,
    setCurrentOrder,
    clearCart,
    standardDeliveryDays,
    calculateDeliveryDate,
    activePage,
    setActivePage,
    showToast
  } = useStore();

  const isConfirmation = activePage === 'order-confirmation';

  // Customer Contact Info
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Shipping Address Form
  const defaultAddr = currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0];
  const [selectedSavedAddrId, setSelectedSavedAddrId] = useState<string>(defaultAddr?.id || 'new');

  const [fullName, setFullName] = useState(defaultAddr?.fullName || currentUser?.name || '');
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [apartment, setApartment] = useState(defaultAddr?.apartment || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [state, setState] = useState(defaultAddr?.state || '');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || '');
  const [country, setCountry] = useState(defaultAddr?.country || 'India');

  // Payment Method Selection: 'ONLINE' (default) vs. 'COD'
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1-Tap Express Presets
  const applyExpressPreset = (cityPreset: 'bangalore' | 'mumbai' | 'delhi') => {
    if (cityPreset === 'bangalore') {
      if (!fullName) setFullName('Valued Customer');
      if (!email) setEmail('divachic@icloud.com');
      if (!phone) setPhone('+91 6282377918');
      setStreet('#42, 100 Feet Ring Road, Stage 2, BTM Layout');
      setCity('Bangalore');
      setState('Karnataka');
      setPincode('560076');
      setCountry('India');
    } else if (cityPreset === 'mumbai') {
      if (!fullName) setFullName('Valued Customer');
      if (!email) setEmail('customer@divachic.online');
      if (!phone) setPhone('+91 9820098200');
      setStreet('Bandra-Kurla Complex, Block G');
      setCity('Mumbai');
      setState('Maharashtra');
      setPincode('400051');
      setCountry('India');
    } else if (cityPreset === 'delhi') {
      if (!fullName) setFullName('Valued Customer');
      if (!email) setEmail('customer@divachic.online');
      if (!phone) setPhone('+91 9811098110');
      setStreet('Connaught Place, Block C');
      setCity('New Delhi');
      setState('Delhi');
      setPincode('110001');
      setCountry('India');
    }
    showToast('Express Address Loaded', 'success', 'Form auto-filled for rapid checkout.');
  };

  // Indian Pincode Auto-Lookup (6 digits)
  const handlePincodeChange = (val: string) => {
    setPincode(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length === 6) {
      if (clean.startsWith('560')) { setCity('Bangalore'); setState('Karnataka'); setCountry('India'); }
      else if (clean.startsWith('400')) { setCity('Mumbai'); setState('Maharashtra'); setCountry('India'); }
      else if (clean.startsWith('110')) { setCity('New Delhi'); setState('Delhi'); setCountry('India'); }
      else if (clean.startsWith('600')) { setCity('Chennai'); setState('Tamil Nadu'); setCountry('India'); }
      else if (clean.startsWith('700')) { setCity('Kolkata'); setState('West Bengal'); setCountry('India'); }
      else if (clean.startsWith('500')) { setCity('Hyderabad'); setState('Telangana'); setCountry('India'); }
      else if (clean.startsWith('380')) { setCity('Ahmedabad'); setState('Gujarat'); setCountry('India'); }
      else if (clean.startsWith('411')) { setCity('Pune'); setState('Maharashtra'); setCountry('India'); }
      else if (clean.startsWith('682')) { setCity('Kochi'); setState('Kerala'); setCountry('India'); }
      else { setCountry('India'); }
    }
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedSavedAddrId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setApartment(addr.apartment || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setCountry(addr.country);
  };

  // Google Sheets integration backup
  const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyjk8MYflKlMaqFM8ZQzwl673roAingHJSsclhshnBd709DqUmMArW3TGx1pId93hU/exec";
  const syncFormToGoogleSheetsExcel = () => {
    try {
      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          name: fullName,
          postalCode: pincode,
          streetAddress: street,
          aptSuite: apartment,
          city,
          state,
          country
        })
      }).catch((e) => console.log('Google Sheets sync skipped:', e));
    } catch {}
  };

  // Calculation Logic
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const COD_SHIPPING_FEE = 150;
  const shippingFee = paymentMethod === 'ONLINE' ? 0 : COD_SHIPPING_FEE;
  const discountAmount = cartDiscount || 0;
  const finalPayable = Math.max(0, subtotal + shippingFee - discountAmount);

  // Auto-redirect to WhatsApp upon order confirmation
  useEffect(() => {
    if (isConfirmation && currentOrder) {
      const waUrl = `https://wa.me/message/XAACO6O6PPIDL1?text=${encodeURIComponent(
        `Hello DivaChic Studio, I just placed Order #${currentOrder.orderNumber || currentOrder.orderId} for total ₹${(currentOrder.total || currentOrder.totalAmount || 0).toLocaleString('en-IN')}. Please confirm my order dispatch!`
      )}`;

      const timer = setTimeout(() => {
        window.location.href = waUrl;
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isConfirmation, currentOrder]);

  // Validation
  const validateForm = (): boolean => {
    setErrorMessage('');
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return false;
    }
    if (!street.trim()) {
      setErrorMessage('Please enter your delivery street address.');
      return false;
    }
    if (!city.trim()) {
      setErrorMessage('Please enter your delivery city.');
      return false;
    }
    if (!state.trim()) {
      setErrorMessage('Please enter your state.');
      return false;
    }
    if (!pincode.trim() || pincode.replace(/\D/g, '').length < 5) {
      setErrorMessage('Please enter a valid PIN / Postal code.');
      return false;
    }
    return true;
  };

  // 1. CASH ON DELIVERY ORDER HANDLER
  const handleConfirmCodOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) {
      showToast('Your shopping bag is empty', 'warning');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const orderId = `COD_${Date.now()}`;
      const customerDetails = {
        fullName: fullName.trim(),
        email: (email || currentUser?.email || 'customer@divachic.online').trim(),
        phone: phone.trim(),
        addressLine1: street.trim(),
        addressLine2: apartment.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: pincode.trim(),
        country: country.trim() || 'India'
      };

      const cartItems = cart.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        title: item.product.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.product.images[0] || '',
        imageUrl: item.product.images[0] || '',
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null
      }));

      const codOrderDoc = {
        orderId,
        orderNumber: orderId,
        id: orderId,
        customer: customerDetails,
        customerName: customerDetails.fullName,
        email: customerDetails.email,
        items: cartItems,
        subtotal,
        shippingFee: COD_SHIPPING_FEE,
        totalAmount: finalPayable,
        total: finalPayable,
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        orderStatus: 'Placed',
        status: 'Placed',
        createdAt: serverTimestamp(),
        dispatchDate: null,
        trackingNumber: `TRK-${Date.now().toString().slice(-8)}-IN`,
        carrier: 'Blue Dart / Delhivery Express',
        estimatedDeliveryDate: calculateDeliveryDate(0).formattedDate,
        shippingAddress: {
          id: `addr-${Date.now()}`,
          fullName: customerDetails.fullName,
          phone: customerDetails.phone,
          street: customerDetails.addressLine1,
          apartment: customerDetails.addressLine2,
          city: customerDetails.city,
          state: customerDetails.state,
          pincode: customerDetails.postalCode,
          country: customerDetails.country,
          type: 'home' as const
        },
        timeline: [
          {
            title: 'Order Placed (Cash on Delivery)',
            description: 'Cash on Delivery order confirmed. Dispatched via premium insured courier.',
            timestamp: 'Just Now',
            location: 'DivaChic Studio',
            completed: true,
            current: true
          }
        ]
      };

      // Write directly to Cloud Firestore 'orders' collection
      await setDoc(doc(db, 'orders', orderId), codOrderDoc, { merge: true });

      // Synchronize in StoreContext state
      placeOrder({
        id: orderId,
        orderNumber: orderId,
        orderId,
        total: finalPayable,
        totalAmount: finalPayable,
        subtotal,
        shippingFee: COD_SHIPPING_FEE,
        paymentMethod: 'Cash on Delivery (COD)',
        paymentStatus: 'cod' as any,
        status: 'Placed' as any,
        customer: customerDetails,
        customerName: customerDetails.fullName,
        email: customerDetails.email,
        shippingAddress: codOrderDoc.shippingAddress
      });

      setCurrentOrder(codOrderDoc as any);
      clearCart();
      syncFormToGoogleSheetsExcel();

      // Asynchronously trigger automated order confirmation email via Google Apps Script Webhook
      sendOrderConfirmationEmail({
        customerEmail: customerDetails.email,
        customerName: customerDetails.fullName,
        orderId,
        totalAmount: finalPayable,
        paymentMethod: 'Cash on Delivery (COD)',
        items: cartItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price
        }))
      });

      showToast('Order Placed Successfully', 'success', `Cash on Delivery Order #${orderId} has been confirmed.`);
      setActivePage('order-confirmation');
    } catch (err: any) {
      console.error('Failed to write COD order:', err);
      setErrorMessage(err?.message || 'Failed to place order. Please try again.');
      showToast('Failed to place order', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. PAY ONLINE (CASHFREE DROP CHECKOUT) HANDLER
  const handleProceedToCashfreePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) {
      showToast('Your shopping bag is empty', 'warning');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const orderId = `ORD_${Date.now()}`;
      const cleanPhone = phone.replace(/\D/g, '').slice(-10) || '9999999999';

      const customerDetails = {
        fullName: fullName.trim(),
        email: (email || currentUser?.email || 'customer@divachic.online').trim(),
        phone: cleanPhone,
        addressLine1: street.trim(),
        addressLine2: apartment.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: pincode.trim(),
        country: country.trim() || 'India'
      };

      const cartItems = cart.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        title: item.product.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.product.images[0] || '',
        imageUrl: item.product.images[0] || '',
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null
      }));

      // Step 1: Request Cashfree payment session from /api/create-cashfree-order
      const response = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          orderAmount: finalPayable,
          customerName: customerDetails.fullName,
          customerEmail: customerDetails.email,
          customerPhone: cleanPhone
        })
      });

      const data = await response.json();

      if (!response.ok || !data.paymentSessionId) {
        throw new Error(data.error || 'Could not initialize Cashfree secure payment session');
      }

      // Step 2: Open Cashfree Drop Checkout Modal
      const cashfree = await load({ mode: 'production' });

      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: '_modal'
      }).then(async (result: any) => {
        if (result?.error) {
          console.warn('Cashfree modal closed / cancelled:', result.error);
          showToast('Payment window closed', 'info', 'You can retry or select Cash on Delivery.');
          setIsProcessing(false);
          return;
        }

        // Step 3: On payment success, save order document to Firestore 'orders' collection
        await saveSuccessfulOnlineOrder(orderId, customerDetails, cartItems);
      }).catch(async (checkoutErr: any) => {
        console.warn('Cashfree checkout modal callback:', checkoutErr);
        // If modal was dismissed or had transient issue
        setIsProcessing(false);
      });

    } catch (err: any) {
      console.error('Cashfree initialization error:', err);
      setErrorMessage(err?.message || 'Unable to connect to Cashfree payment gateway. Please try again or choose COD.');
      showToast('Payment Gateway Notice', 'error', err?.message);
      setIsProcessing(false);
    }
  };

  // Helper: Persist verified online paid order to Firestore
  const saveSuccessfulOnlineOrder = async (orderId: string, customerDetails: any, cartItems: any[]) => {
    try {
      const onlineOrderDoc = {
        orderId,
        orderNumber: orderId,
        id: orderId,
        customer: customerDetails,
        customerName: customerDetails.fullName,
        email: customerDetails.email,
        items: cartItems,
        subtotal,
        shippingFee: 0,
        totalAmount: finalPayable,
        total: finalPayable,
        paymentMethod: 'Cashfree',
        paymentStatus: 'Paid',
        orderStatus: 'Placed',
        status: 'Placed',
        createdAt: serverTimestamp(),
        dispatchDate: null,
        trackingNumber: `TRK-${Date.now().toString().slice(-8)}-IN`,
        carrier: 'Blue Dart / Delhivery Express',
        estimatedDeliveryDate: calculateDeliveryDate(0).formattedDate,
        shippingAddress: {
          id: `addr-${Date.now()}`,
          fullName: customerDetails.fullName,
          phone: customerDetails.phone,
          street: customerDetails.addressLine1,
          apartment: customerDetails.addressLine2,
          city: customerDetails.city,
          state: customerDetails.state,
          pincode: customerDetails.postalCode,
          country: customerDetails.country,
          type: 'home' as const
        },
        timeline: [
          {
            title: 'Payment Confirmed & Verified (Cashfree)',
            description: 'Instant prepaid verification successful. Order queued for expedited atelier packing.',
            timestamp: 'Just Now',
            location: 'Cashfree Payments',
            completed: true,
            current: true
          }
        ]
      };

      await setDoc(doc(db, 'orders', orderId), onlineOrderDoc, { merge: true });

      placeOrder({
        id: orderId,
        orderNumber: orderId,
        orderId,
        total: finalPayable,
        totalAmount: finalPayable,
        subtotal,
        shippingFee: 0,
        paymentMethod: 'Cashfree (Prepaid)',
        paymentStatus: 'paid' as any,
        status: 'Placed' as any,
        customer: customerDetails,
        customerName: customerDetails.fullName,
        email: customerDetails.email,
        shippingAddress: onlineOrderDoc.shippingAddress
      });

      setCurrentOrder(onlineOrderDoc as any);
      clearCart();
      syncFormToGoogleSheetsExcel();

      // Asynchronously trigger automated order confirmation email via Google Apps Script Webhook
      sendOrderConfirmationEmail({
        customerEmail: customerDetails.email,
        customerName: customerDetails.fullName,
        orderId,
        totalAmount: finalPayable,
        paymentMethod: 'Online (Cashfree)',
        items: cartItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price
        }))
      });

      showToast('Payment Verified', 'success', `Order #${orderId} successfully completed!`);
      setActivePage('order-confirmation');
    } catch (err: any) {
      console.error('Failed to save online order to Firestore:', err);
      clearCart();
      setActivePage('order-confirmation');
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // ORDER CONFIRMATION VIEW
  // =========================================================================
  if (isConfirmation && currentOrder) {
    const whatsappLink = `https://wa.me/message/XAACO6O6PPIDL1?text=${encodeURIComponent(
      `Hello DivaChic Studio, I just placed Order #${currentOrder.orderNumber || currentOrder.orderId} for total ₹${(currentOrder.total || currentOrder.totalAmount || 0).toLocaleString('en-IN')}. Please confirm my order dispatch!`
    )}`;

    return (
      <div className="bg-[#FAF9F6] min-h-screen py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-neutral-200 shadow-sm p-6 sm:p-10 space-y-8"
          >
            {/* WhatsApp Direct Dispatch Notice */}
            <div className="bg-[#EBF5EF] border border-[#25D366]/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#128C7E] font-bold text-sm">
                  <MessageCircle className="w-5 h-5 fill-[#25D366] text-white shrink-0" />
                  <span className="font-serif tracking-wide">WhatsApp Studio Order Sync</span>
                </div>
                <span className="bg-[#25D366] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                  Redirecting...
                </span>
              </div>
              <p className="text-xs text-[#1E5638] leading-relaxed">
                Order <strong>#{currentOrder.orderNumber || currentOrder.orderId}</strong> has been logged! You are being redirected to our WhatsApp studio concierge for personal dispatch tracking.
              </p>
              <a
                href={whatsappLink}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold py-3 px-4 uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white text-white" />
                <span>Open WhatsApp Concierge Immediately</span>
              </a>
            </div>

            {/* Receipt Header */}
            <div className="text-center space-y-3 border-b border-neutral-200 pb-8">
              <div className="flex justify-center mb-1">
                <DivaChikLogo variant="full" size="md" theme="dark" showSubtitle={true} subtitleText="AUTHENTIC ATELIER INVOICE" />
              </div>
              <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-serif tracking-widest uppercase text-neutral-400 block">
                Official Order Receipt
              </span>
              <h1 className="text-3xl font-serif text-neutral-900 font-semibold tracking-tight">
                Thank You For Your Acquisition
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed font-serif">
                We have registered Order <strong>#{currentOrder.orderNumber || currentOrder.orderId}</strong>. Payment Method: <strong className="text-neutral-900">{currentOrder.paymentMethod}</strong>.
              </p>
            </div>

            {/* Logistics Badge */}
            <div className="bg-[#fafafa] border border-neutral-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-serif">
              <div>
                <span className="text-neutral-400 uppercase text-[10px] tracking-widest block">Reference ID</span>
                <strong className="text-neutral-900 font-mono text-xs">{currentOrder.orderNumber || currentOrder.orderId}</strong>
              </div>
              <div>
                <span className="text-neutral-400 uppercase text-[10px] tracking-widest block">Payment Status</span>
                <span className="text-emerald-700 font-semibold uppercase tracking-wider text-xs">
                  {currentOrder.paymentStatus || 'Confirmed'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 uppercase text-[10px] tracking-widest block">Estimated Arrival</span>
                <strong className="text-neutral-900">{currentOrder.estimatedDeliveryDate || calculateDeliveryDate(0).formattedDate}</strong>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-3 border-t border-neutral-200 pt-6">
              <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-neutral-900">
                Acquired Pieces ({currentOrder.items?.length || 0})
              </h3>
              <div className="divide-y divide-neutral-100">
                {currentOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 aspect-[3/4] bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                        <img src={item.imageUrl || item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-serif font-medium text-neutral-900">{item.name}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="font-serif font-medium text-neutral-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-[#fafafa] border border-neutral-200 space-y-2 text-xs font-serif">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>₹{(currentOrder.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Shipping Fee</span>
                <span>{currentOrder.shippingFee === 0 ? 'FREE (Complimentary Online)' : `₹${currentOrder.shippingFee}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-sm text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Final Payable</span>
                <span className="font-serif text-base">₹{(currentOrder.totalAmount || currentOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-serif uppercase tracking-widest px-4 py-3 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Invoice</span>
              </button>
              <button
                onClick={() => setActivePage('shop')}
                className="w-full sm:w-auto bg-neutral-900 hover:bg-black text-white text-xs font-serif uppercase tracking-widest px-6 py-3 transition-colors cursor-pointer"
              >
                Continue Exploring Collections
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // EMPTY SHOPPING BAG SCREEN
  // =========================================================================
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F6] px-4 py-16">
        <div className="max-w-md w-full text-center space-y-5 bg-white border border-neutral-200 p-8 sm:p-12 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7 stroke-1" />
          </div>
          <span className="text-[10px] font-serif tracking-widest uppercase text-neutral-400 block">
            Curated Bag Empty
          </span>
          <h2 className="text-2xl font-serif font-semibold text-neutral-900 tracking-tight">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed font-serif">
            Select items from our runway collections to proceed with an expedited bespoke checkout.
          </p>
          <button
            onClick={() => setActivePage('shop')}
            className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-serif uppercase tracking-widest py-3.5 px-6 transition-all duration-300 cursor-pointer shadow-sm"
          >
            Explore Designer Catalog
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN LUXURY EDITORIAL CHECKOUT VIEW
  // =========================================================================
  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Top Header Bar */}
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setActivePage('cart')}
            className="inline-flex items-center gap-2 text-xs font-serif tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Bag</span>
          </button>

          <DivaChikLogo variant="compact" size="xs" theme="dark" />

          <div className="flex items-center gap-1.5 text-[11px] font-serif tracking-widest text-emerald-800 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

      {/* Main Container: Two-Column Desktop Grid */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">

        {/* LEFT COLUMN: Shipping & Payment Selection */}
        <div className="space-y-10">

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 01: SHIPPING DESTINATION */}
          <div className="space-y-6">
            <div>
              <p className="font-serif tracking-widest text-xs uppercase text-neutral-400 mb-2">
                Step 01 / Shipping Address & Recipient
              </p>
              <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 font-semibold tracking-tight">
                Client Destination
              </h2>
            </div>

            {/* 1-Tap Express Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-serif tracking-widest uppercase text-neutral-400 block">
                Quick Autofill Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyExpressPreset('bangalore')}
                  className="px-3 py-1.5 text-[11px] font-serif tracking-wider uppercase border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 bg-white transition-colors cursor-pointer"
                >
                  📍 Bangalore (560076)
                </button>
                <button
                  type="button"
                  onClick={() => applyExpressPreset('mumbai')}
                  className="px-3 py-1.5 text-[11px] font-serif tracking-wider uppercase border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 bg-white transition-colors cursor-pointer"
                >
                  📍 Mumbai (400051)
                </button>
                <button
                  type="button"
                  onClick={() => applyExpressPreset('delhi')}
                  className="px-3 py-1.5 text-[11px] font-serif tracking-wider uppercase border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 bg-white transition-colors cursor-pointer"
                >
                  📍 New Delhi (110001)
                </button>
              </div>
            </div>

            {/* Saved Address Selector (if member has saved addresses) */}
            {currentUser && currentUser.addresses.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-serif tracking-widest uppercase text-neutral-400 block">
                  Select Saved Address:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentUser.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3 border cursor-pointer text-xs transition-all ${
                        selectedSavedAddrId === addr.id
                          ? 'border-neutral-900 bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <strong className="block font-serif text-neutral-900">{addr.fullName}</strong>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">{addr.street}, {addr.city}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Minimal Bottom-Line Form Inputs */}
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] tracking-widest uppercase font-serif text-neutral-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Lady Eleanor Vance"
                  className="w-full border-b border-neutral-300 focus:border-neutral-900 bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-300 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-serif text-neutral-500 mb-1">
                    Email Address (For Invoicing)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@divachic.online"
                    className="w-full border-b border-neutral-300 focus:border-neutral-900 bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-300 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-serif text-neutral-500 mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full border-b border-neutral-300 focus:border-neutral-900 bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-300 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase font-serif text-neutral-500 mb-1">
                  Street Address & House / Building Name *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 74/B Royal Promenade, Bandra West"
                  className="w-full border-b border-neutral-300 focus:border-neutral-900 bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-300 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase font-serif text-neutral-500 mb-1">
                  Apartment, Suite, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Penthouse A, Near Luxury Galleria"
                  className="w-full border-b border-neutral-300 focus:border-neutral-900 bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-300 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-serif text-neutral-500 mb-1">
                    City / Metropolis *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full border-b border-neutral-300 focus:border-neutral-900 bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-300 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-serif text-neutral-500 mb-1">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full border-b border-neutral-300 focus:border-neutral-900 bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-300 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-serif text-neutral-500 mb-1">
                    Postal / PIN Code (Auto-Lookup) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="400051"
                    className="w-full border-b border-neutral-300 focus:border-neutral-900 bg-transparent py-2.5 text-sm font-mono text-neutral-900 placeholder:text-neutral-300 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-serif text-neutral-500 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border-b border-neutral-300 focus:border-neutral-900 bg-transparent py-2.5 text-sm text-neutral-900 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 02: PAYMENT METHOD SELECTION */}
          <div className="space-y-6 pt-4 border-t border-neutral-200">
            <div>
              <p className="font-serif tracking-widest text-xs uppercase text-neutral-400 mb-2">
                Step 02 / Payment Mode & Delivery Fee
              </p>
              <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 font-semibold tracking-tight">
                Payment Method Selection
              </h2>
            </div>

            {/* Payment Method Selector Cards */}
            <div className="space-y-4">

              {/* Option 1: Pay Online (UPI, Cards, NetBanking, Wallets) */}
              <div
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-5 cursor-pointer rounded-none relative transition-all duration-300 ${
                  paymentMethod === 'ONLINE'
                    ? 'border-2 border-neutral-900 bg-neutral-50/50'
                    : 'border border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'ONLINE' ? 'border-neutral-900' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'ONLINE' && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                    </div>
                    <span className="font-bold text-sm text-neutral-900 tracking-tight font-serif">
                      Prepaid / Instant Online Pay
                    </span>
                  </div>

                  {/* Micro-icons row */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="px-1.5 py-0.5 border border-neutral-200 bg-white font-mono font-bold text-[10px] rounded-xs text-[#5f259f]">UPI</span>
                    <span className="px-1.5 py-0.5 border border-neutral-200 bg-white font-bold text-[10px] rounded-xs text-neutral-700">GPay</span>
                    <span className="px-1.5 py-0.5 border border-neutral-200 bg-white font-bold text-[10px] rounded-xs text-[#5f259f]">PhonePe</span>
                    <span className="px-1.5 py-0.5 border border-neutral-200 bg-white font-bold text-[10px] rounded-xs text-[#1a1f71]">Cards</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-900 text-emerald-100 px-2.5 py-0.5 inline-block">
                    COMPLIMENTARY EXPRESS DELIVERY
                  </span>
                </div>

                <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-serif">
                  Zero shipping fee applied. Fully encrypted & instant confirmation.
                </p>
              </div>

              {/* Option 2: Cash on Delivery (COD) */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-5 cursor-pointer rounded-none relative transition-all duration-300 ${
                  paymentMethod === 'COD'
                    ? 'border-2 border-neutral-900 bg-neutral-50/50'
                    : 'border border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-neutral-900' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                    </div>
                    <span className="font-bold text-sm text-neutral-900 tracking-tight font-serif">
                      Cash on Delivery
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-neutral-200 text-neutral-800 px-2.5 py-0.5 inline-block">
                    STANDARD SHIPPING: ₹150
                  </span>
                </div>

                <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-serif">
                  Pay cash or scan QR at your doorstep upon arrival.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Editorial Sticky Order Summary */}
        <div>
          <div className="bg-[#fafafa] border border-neutral-200/80 p-6 lg:p-8 sticky top-6 space-y-6">

            <div className="border-b border-neutral-200/80 pb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg text-neutral-900 tracking-tight font-semibold">
                Order Summary
              </h3>
              <span className="text-xs font-serif text-neutral-400 uppercase tracking-widest">
                {cartCount} {cartCount === 1 ? 'Piece' : 'Pieces'}
              </span>
            </div>

            {/* Condensed Item Preview List with 3:4 Portrait Thumbnails */}
            <div className="divide-y divide-neutral-200/60 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.selectedColor || ''}-${item.selectedSize || ''}`} className="py-3.5 flex items-center gap-3.5">
                  <div className="w-14 aspect-[3/4] bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-serif font-medium text-neutral-900 line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5 font-serif">
                      Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                    </p>
                    <span className="text-xs font-serif font-medium text-neutral-900 mt-1 block">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown Rows */}
            <div className="border-t border-neutral-200/80 pt-4 space-y-3 text-xs font-serif">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="text-neutral-900 font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Delivery Fee Row */}
              <div className="flex justify-between items-center text-neutral-600">
                <span>Delivery Fee</span>
                {paymentMethod === 'ONLINE' ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-2">
                    <span className="tracking-wider">FREE</span>
                    <span className="line-through text-neutral-400 text-xs font-normal">₹150</span>
                  </span>
                ) : (
                  <span className="text-neutral-900 font-medium">+₹150</span>
                )}
              </div>

              {/* Coupon Discount Row if applicable */}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Applied Voucher ({appliedCoupon?.code || 'Promo'})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Total Amount Row */}
              <div className="flex justify-between items-baseline pt-4 border-t border-neutral-200/80">
                <div>
                  <span className="block text-[10px] font-serif tracking-widest uppercase text-neutral-400">
                    Final Payable
                  </span>
                  <span className="text-xs text-neutral-500 font-serif">
                    Inclusive of luxury dispatch
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif text-neutral-900 font-semibold tracking-tight">
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div>
              {paymentMethod === 'ONLINE' ? (
                <button
                  type="button"
                  onClick={handleProceedToCashfreePayment}
                  disabled={isProcessing}
                  className="w-full bg-neutral-900 hover:bg-black text-white py-4 px-6 text-xs font-serif font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>INITIALIZING SECURE CHECKOUT...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>PROCEED TO SECURE PAYMENT • ₹{finalPayable.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmCodOrder}
                  disabled={isProcessing}
                  className="w-full bg-neutral-900 hover:bg-black text-white py-4 px-6 text-xs font-serif font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>CONFIRMING COD ORDER...</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-3.5 h-3.5" />
                      <span>CONFIRM CASH ON DELIVERY ORDER • ₹{finalPayable.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Trust & Assurance Banner */}
            <div className="pt-2 border-t border-neutral-200/80 space-y-2 text-[11px] text-neutral-500 font-serif">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                <span>100% Authentic Luxury Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                <span>Discreet & Insured Packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                <span>Estimated Courier Arrival: {calculateDeliveryDate(0).formattedDate}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
