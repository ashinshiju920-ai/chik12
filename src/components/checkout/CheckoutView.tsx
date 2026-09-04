import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { DivaChikLogo } from '../common/DivaChikLogo';
import { Address } from '../../types';
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
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Gift,
  ShoppingBag
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartCount,
    cartDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    currentUser,
    placeOrder,
    currentOrder,
    setCurrentOrder,
    clearCart,
    calculateDeliveryDate,
    activePage,
    setActivePage,
    showToast,
    setIsAuthModalOpen
  } = useStore();

  const isConfirmation = activePage === 'order-confirmation';

  // Anti-bot armor & timing protection
  const [botHoneypot, setBotHoneypot] = useState('');
  const formMountTime = useRef(Date.now());
  const lastSyncTime = useRef(0);

  // Address and User Defaults
  const defaultAddr = currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0];
  const initialFullName = defaultAddr?.fullName || currentUser?.name || '';
  const nameParts = initialFullName.trim().split(/\s+/);
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.slice(1).join(' ') || '';

  // Form States (Matching Bergdorf Goodman luxury form fields)
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || defaultAddr?.phone || '');
  const [country, setCountry] = useState(defaultAddr?.country || 'India');
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [apartment, setApartment] = useState(defaultAddr?.apartment || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [state, setState] = useState(defaultAddr?.state || '');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || '');
  const [selectedSavedAddrId, setSelectedSavedAddrId] = useState<string>(defaultAddr?.id || 'new');

  // Mobile Order Summary Accordion
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Standard Packaging (zero extra fee)
  const packagingOption = 'Standard';

  // Gift Option
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Accordions for Promo & Gift Cards
  const [promoOpen, setPromoOpen] = useState(false);
  const [giftCardOpen, setGiftCardOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [giftCardInput, setGiftCardInput] = useState('');

  // Payment Method Selection: 'ONLINE' (default) vs. 'COD'
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pincode input handler
  const handlePincodeChange = (val: string) => {
    setPincode(val.replace(/\D/g, '').slice(0, 6));
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedSavedAddrId(addr.id);
    const parts = (addr.fullName || '').trim().split(/\s+/);
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setPhone(addr.phone || '');
    setStreet(addr.street || '');
    setApartment(addr.apartment || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPincode(addr.pincode || '');
    setCountry(addr.country || 'India');
  };

  // Google Sheets integration backup - 100% synchronized with exact field mappings
  const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyjk8MYflKlMaqFM8ZQzwl673roAingHJSsclhshnBd709DqUmMArW3TGx1pId93hU/exec";
  
  const syncFormToGoogleSheetsExcel = (overrides?: Record<string, string>) => {
    // Rate limit: at least 600ms between calls to avoid spamming
    const now = Date.now();
    if (now - lastSyncTime.current < 600) return;
    lastSyncTime.current = now;

    // Discard bot submissions
    if (botHoneypot) return;

    try {
      const computedName = overrides?.name || `${firstName.trim()} ${lastName.trim()}`.trim();
      const payload = {
        email: (overrides?.email ?? email).trim(),
        phone: (overrides?.phone ?? phone).trim(),
        name: computedName,
        postalCode: (overrides?.postalCode ?? pincode).trim(),
        streetAddress: (overrides?.streetAddress ?? street).trim(),
        aptSuite: (overrides?.aptSuite ?? apartment).trim(),
        city: (overrides?.city ?? city).trim(),
        state: (overrides?.state ?? state).trim(),
        country: (overrides?.country ?? country).trim() || 'India'
      };

      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch((e) => console.log('Google Sheets sync skipped:', e));
    } catch (e) {
      console.log('Google Sheets sync error:', e);
    }
  };

  // Pricing Logic
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const COD_SHIPPING_FEE = 150;
  const shippingFee = paymentMethod === 'ONLINE' ? 0 : COD_SHIPPING_FEE;
  const packagingFee = 0;
  const discountAmount = cartDiscount || 0;
  const finalPayable = Math.max(0, subtotal + shippingFee + packagingFee - discountAmount);

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

  // Validation with Anti-Bot Armor
  const validateForm = (): boolean => {
    setErrorMessage('');

    // Reject automated scraper bots
    if (botHoneypot) {
      console.warn('Bot submission blocked via honeypot.');
      return false;
    }
    if (Date.now() - formMountTime.current < 500) {
      console.warn('Rapid automated form submission rejected.');
      return false;
    }

    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return false;
    }
    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name.');
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

  // Promo code submission
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const success = applyCoupon(promoInput.trim());
    if (success) {
      showToast('Promo Code Applied', 'success', `Discount voucher applied.`);
      setPromoInput('');
    } else {
      showToast('Invalid Promo Code', 'error', 'Please enter a valid code like DIVAGIFT or WELCOME10');
    }
  };

  // Gift card submission
  const handleApplyGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardInput.trim()) return;
    const success = applyCoupon(giftCardInput.trim());
    if (success) {
      showToast('Gift Card Redeemed', 'success');
      setGiftCardInput('');
    } else {
      showToast('Gift Card Notice', 'info', 'No active gift balance found for this card number.');
    }
  };

  // Scroll to payment section helper
  const handleContinueToPayment = () => {
    if (validateForm()) {
      syncFormToGoogleSheetsExcel();
      const el = document.getElementById('payment-methods-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
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
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const customerDetails = {
        fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: (email || currentUser?.email || 'customer@divachic.online').trim(),
        phone: phone.trim(),
        addressLine1: street.trim(),
        addressLine2: apartment.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: pincode.trim(),
        country: country.trim() || 'India',
        packaging: packagingOption,
        isGift,
        giftMessage: isGift ? giftMessage : ''
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
        packagingFee,
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
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const customerDetails = {
        fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: (email || currentUser?.email || 'customer@divachic.online').trim(),
        phone: cleanPhone,
        addressLine1: street.trim(),
        addressLine2: apartment.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: pincode.trim(),
        country: country.trim() || 'India',
        packaging: packagingOption,
        isGift,
        giftMessage: isGift ? giftMessage : ''
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

      // Synchronize form values to Google Sheet immediately
      syncFormToGoogleSheetsExcel();

      // Step 1: Request Cashfree payment session from backend API
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
        packagingFee,
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
      <div className="bg-[#FAF9F6] min-h-screen py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-neutral-200 shadow-sm p-5 sm:p-10 space-y-6 sm:space-y-8"
          >
            {/* WhatsApp Direct Dispatch Notice */}
            <div className="bg-[#EBF5EF] border border-[#25D366]/40 p-4 sm:p-5 space-y-3">
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
                className="w-full bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.98] text-white text-xs font-bold py-3 px-4 uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
              <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900 font-semibold tracking-tight">
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
              {currentOrder.packagingFee > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>Signature Packaging</span>
                  <span>₹{currentOrder.packagingFee}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-sm text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Final Payable</span>
                <span className="font-serif text-base">₹{(currentOrder.totalAmount || currentOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto active:scale-95 inline-flex items-center justify-center gap-2 border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-serif uppercase tracking-widest px-4 py-3 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Invoice</span>
              </button>
              <button
                onClick={() => setActivePage('shop')}
                className="w-full sm:w-auto active:scale-95 bg-neutral-900 hover:bg-black text-white text-xs font-serif uppercase tracking-widest px-6 py-3 transition-all cursor-pointer"
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
      <div className="min-h-[70vh] flex items-center justify-center bg-white px-4 py-16">
        <div className="max-w-md w-full text-center space-y-5 bg-white border border-neutral-200 p-8 sm:p-12 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-neutral-50 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-200">
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
            className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-serif uppercase tracking-widest py-3.5 px-6 transition-all duration-300 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            Explore Designer Catalog
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN LUXURY EDITORIAL CHECKOUT VIEW (BERGDORF GOODMAN DEMO ANATOMY)
  // =========================================================================
  return (
    <div className="bg-white min-h-screen text-neutral-900 font-sans pb-12 sm:pb-0">
      
      {/* 1. TOP EDITORIAL BRAND HEADER */}
      <div className="bg-white border-b border-neutral-200 py-4 sm:py-6 text-center">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between relative">
          <button
            onClick={() => setActivePage('cart')}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Return to Bag</span>
          </button>
          
          <div className="mx-auto cursor-pointer" onClick={() => setActivePage('home')}>
            <h1 className="font-serif text-xl sm:text-3xl tracking-[0.22em] uppercase text-neutral-900 font-normal">
              DIVACHIC COUTURE
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-sans tracking-widest text-neutral-600 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden md:inline">256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      {/* 2. BLACK LUXURY PROMO BANNER (As seen in Bergdorf Goodman Demo) */}
      <div className="bg-black text-white py-2 sm:py-2.5 px-4 text-center text-xs tracking-wide">
        <span className="font-serif text-[11px] sm:text-xs">
          Earn a ₹500 - ₹2,500 Gift Voucher with code <strong className="font-sans font-bold underline tracking-wider cursor-pointer" onClick={() => { setPromoOpen(true); setPromoInput('DIVAGIFT'); }}>DIVAGIFT</strong> <span className="underline cursor-pointer ml-1 text-neutral-300 hover:text-white" onClick={() => setPromoOpen(true)}>Details</span>
        </span>
        <span className="mx-3 text-neutral-600 hidden sm:inline">|</span>
        <span className="text-neutral-300 hidden sm:inline font-serif text-xs">
          🚀 Delivery Done by Shiprocket • 🔄 Free Doorstep Return Pickup (Up to 7 Days)
        </span>
      </div>

      {/* 2b. MOBILE ORDER SUMMARY ACCORDION (Shopify / Bergdorf luxury mobile standard) */}
      <div className="lg:hidden border-b border-neutral-200 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="flex items-center gap-2 text-xs font-serif font-medium text-neutral-800 cursor-pointer active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-4 h-4 text-neutral-600" />
            <span>{mobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${mobileSummaryOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className="font-serif font-bold text-sm text-neutral-900">
            ₹{finalPayable.toLocaleString('en-IN')}
          </div>
        </div>

        {mobileSummaryOpen && (
          <div className="max-w-6xl mx-auto px-4 pb-4 pt-1 border-t border-neutral-200/60 bg-white">
            <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto mb-3">
              {cart.map((item) => (
                <div key={`mob-${item.productId}-${item.selectedColor || ''}-${item.selectedSize || ''}`} className="py-2.5 flex items-center gap-3">
                  <div className="w-12 aspect-[3/4] bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-xs font-serif">
                    <h5 className="font-medium text-neutral-900 truncate">{item.product.name}</h5>
                    <p className="text-[10px] text-neutral-500">Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}</p>
                    <span className="font-bold text-neutral-900 mt-0.5 block">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-xs font-serif pt-2 border-t border-neutral-100">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({cartCount} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery</span>
                <span>{paymentMethod === 'ONLINE' ? 'FREE' : '₹150.00'}</span>
              </div>
              {packagingFee > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>BG Signature Packaging</span>
                  <span>₹{packagingFee.toFixed(2)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN TWO-COLUMN CHECKOUT GRID */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12">

        {/* LEFT COLUMN: Checkout Form & Selection */}
        <div className="space-y-6 sm:space-y-8">

          {/* PAGE TITLE */}
          <h2 className="text-xl sm:text-3xl font-serif font-bold tracking-tight text-neutral-900 uppercase">
            CHECKOUT
          </h2>

          {/* Anti-Bot Armor: Invisible Honeypot Trap */}
          <div className="anti-bot-honey" aria-hidden="true">
            <input
              type="text"
              name="client_fax_honey"
              tabIndex={-1}
              autoComplete="off"
              value={botHoneypot}
              onChange={(e) => setBotHoneypot(e.target.value)}
            />
          </div>

          {/* MEMBER SIGN IN / GUEST PROMPT (Image 1 Box) */}
          <div className="border border-neutral-200 p-4 sm:p-5 bg-[#FAF9F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-serif font-bold text-neutral-900">
                {currentUser ? `Welcome back, ${currentUser.name}!` : 'Sign in to enjoy member perks and faster checkout!'}
              </p>
              <p className="text-[11px] font-serif text-neutral-500 mt-0.5">
                {currentUser ? `Signed in as ${currentUser.email}. Saved atelier addresses active.` : 'Or continue to checkout as a guest below.'}
              </p>
            </div>
            {!currentUser ? (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="border border-neutral-900 hover:bg-neutral-900 hover:text-white active:scale-95 px-6 py-2.5 text-xs font-serif uppercase tracking-widest font-semibold transition-all cursor-pointer shrink-0 text-center"
              >
                SIGN IN
              </button>
            ) : (
              <span className="text-[11px] font-serif text-emerald-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Verified Member
              </span>
            )}
          </div>

          {/* ERROR NOTIFICATION BANNER */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SAVED ADDRESS SELECTOR (If member has multiple addresses) */}
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
                    className={`p-3 border cursor-pointer text-xs transition-all active:scale-[0.99] ${
                      selectedSavedAddrId === addr.id
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
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

          {/* SECTION: SHIPPING ADDRESS (Exact box layout from Image 1) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 font-serif">
              SHIPPING ADDRESS
            </h3>

            <div className="space-y-3">
              {/* Row 1: First name | Last name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors">
                  <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                    First name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => syncFormToGoogleSheetsExcel()}
                    placeholder="First name"
                    className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif"
                  />
                </div>

                <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors">
                  <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                    Last name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => syncFormToGoogleSheetsExcel()}
                    placeholder="Last name"
                    className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif"
                  />
                </div>
              </div>

              {/* Row 2: Email address | Phone number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors">
                  <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                    Email address *
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => syncFormToGoogleSheetsExcel()}
                    placeholder="Email address"
                    className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif"
                  />
                </div>

                <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors">
                  <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                    Phone number *
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => syncFormToGoogleSheetsExcel()}
                    placeholder="Phone number"
                    className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif"
                  />
                </div>
              </div>

              {/* Row 3: Country */}
              <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                    Country
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    onBlur={() => syncFormToGoogleSheetsExcel()}
                    placeholder="India"
                    className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif"
                  />
                </div>
                <div className="text-neutral-400 pl-2 cursor-pointer hover:text-neutral-700" title="All domestic regions and metro cities covered with insured express delivery">
                  <HelpCircle className="w-4 h-4" />
                </div>
              </div>

              {/* Row 4: Address */}
              <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors">
                <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                  Address (House / Flat No., Street, Area) *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  onBlur={() => syncFormToGoogleSheetsExcel()}
                  placeholder="Address"
                  className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif"
                />
              </div>

              {/* Row 5: Address 2 (Optional) */}
              <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors">
                <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                  Address 2 (Apartment, suite, unit, floor, landmark - optional)
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  onBlur={() => syncFormToGoogleSheetsExcel()}
                  placeholder="Address 2"
                  className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif"
                />
              </div>

              {/* Row 6: City */}
              <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors">
                <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => syncFormToGoogleSheetsExcel()}
                  placeholder="City"
                  className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif"
                />
              </div>

              {/* Row 7: State | ZIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors">
                  <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    onBlur={() => syncFormToGoogleSheetsExcel()}
                    placeholder="State"
                    className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif"
                  />
                </div>

                <div className="border border-neutral-300 focus-within:border-black p-2.5 bg-white transition-colors">
                  <label className="block text-[9px] uppercase tracking-wider text-neutral-400 font-serif mb-0.5">
                    ZIP / Postal Code *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    maxLength={6}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    onBlur={() => syncFormToGoogleSheetsExcel()}
                    placeholder="ZIP"
                    className="w-full text-xs text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent font-serif font-mono"
                  />
                </div>
              </div>
            </div>

            {/* CONTINUE BUTTON (Image 1 style) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleContinueToPayment}
                className="w-full sm:w-auto bg-black hover:bg-neutral-800 active:scale-[0.98] text-white font-serif uppercase tracking-widest text-xs py-3.5 px-8 transition-all cursor-pointer font-semibold shadow-xs"
              >
                CONTINUE TO SELECT PAYMENT METHOD
              </button>
            </div>
          </div>

          {/* SECTION: IS THIS A GIFT? (Image 1 style) */}
          <div className="pt-6 border-t border-neutral-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 font-serif">
              IS THIS A GIFT?
            </h3>
            <div>
              <button
                type="button"
                onClick={() => setIsGift(!isGift)}
                className="text-xs font-serif underline text-neutral-700 hover:text-black cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              >
                <Gift className="w-3.5 h-3.5 text-neutral-600" />
                <span>{isGift ? 'Remove Gift Option' : 'Select Gift Option'}</span>
              </button>
            </div>
            {isGift && (
              <div className="pt-2">
                <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1 font-serif">
                  Complimentary Handwritten Card Note (Optional)
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Include a bespoke gift message for the recipient..."
                  maxLength={200}
                  rows={3}
                  className="w-full border border-neutral-300 p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black outline-none font-serif"
                />
              </div>
            )}
          </div>

          {/* SECTION: PROMO AND GIFT CODES (Image 1 style accordions) */}
          <div className="pt-6 border-t border-neutral-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 font-serif">
              PROMO AND GIFT CODES
            </h3>

            <div className="space-y-2">
              {/* Promo Code Accordion */}
              <div className="border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setPromoOpen(!promoOpen)}
                  className="w-full p-3.5 flex items-center justify-between text-xs font-serif font-medium text-neutral-900 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <span>Promo Code</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${promoOpen ? 'rotate-180' : ''}`} />
                </button>
                {promoOpen && (
                  <div className="p-4 bg-[#FAF9F6] border-t border-neutral-200 space-y-2">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                        <span>Voucher <strong>{appliedCoupon.code}</strong> applied (-₹{discountAmount})</span>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-xs underline text-red-600 hover:text-red-800 cursor-pointer font-serif ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyPromo} className="flex gap-2">
                        <input
                          type="text"
                          autoComplete="off"
                          placeholder="Enter Promo Code (e.g. DIVAGIFT)"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="flex-1 border border-neutral-300 p-2.5 text-xs uppercase bg-white outline-none focus:border-black font-serif"
                        />
                        <button
                          type="submit"
                          className="bg-neutral-900 hover:bg-black text-white px-5 py-2.5 text-xs uppercase tracking-wider font-semibold cursor-pointer font-serif active:scale-95"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Gift Card Accordion */}
              <div className="border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setGiftCardOpen(!giftCardOpen)}
                  className="w-full p-3.5 flex items-center justify-between text-xs font-serif font-medium text-neutral-900 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <span>Gift Card</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${giftCardOpen ? 'rotate-180' : ''}`} />
                </button>
                {giftCardOpen && (
                  <div className="p-4 bg-[#FAF9F6] border-t border-neutral-200 space-y-2">
                    <form onSubmit={handleApplyGiftCard} className="flex gap-2">
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="Enter Gift Card Number"
                        value={giftCardInput}
                        onChange={(e) => setGiftCardInput(e.target.value)}
                        className="flex-1 border border-neutral-300 p-2.5 text-xs uppercase bg-white outline-none focus:border-black font-serif"
                      />
                      <button
                        type="submit"
                        className="bg-neutral-900 hover:bg-black text-white px-5 py-2.5 text-xs uppercase tracking-wider font-semibold cursor-pointer font-serif active:scale-95"
                      >
                        Apply
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION: PAYMENT METHOD SELECTOR (WITH CASHFREE LOGOS & ASSURANCE) */}
          <div id="payment-methods-section" className="pt-6 border-t border-neutral-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 font-serif">
              PAYMENT METHOD
            </h3>

            <div className="space-y-3">
              {/* Option 1: Cashfree Payments (Online) */}
              <div
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 sm:p-5 cursor-pointer transition-all border active:scale-[0.99] ${
                  paymentMethod === 'ONLINE'
                    ? 'border-neutral-900 bg-neutral-50/70 ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'ONLINE' ? 'border-neutral-900' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'ONLINE' && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-neutral-900 font-serif">
                        Pay Online via Cashfree Payments
                      </span>
                      <span className="ml-2.5 text-[9px] bg-emerald-900 text-emerald-100 font-bold px-2 py-0.5 uppercase tracking-wider font-sans inline-block">
                        COMPLIMENTARY DELIVERY (SAVE ₹150)
                      </span>
                    </div>
                  </div>

                  {/* Cashfree Verified Partner Badge */}
                  <div className="flex items-center gap-2">
                    <div className="bg-[#120F24] px-2.5 py-1 rounded-xs border border-white/10 flex items-center shadow-xs">
                      <img
                        src="/cashfree-payments.png"
                        alt="Cashfree Payments Verified Partner"
                        className="h-5 w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 mt-2.5 font-serif leading-relaxed">
                  Official 100% RBI Authorized payment gateway partner. Instant checkout via UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, and Wallets.
                </p>
              </div>

              {/* Option 2: Cash on Delivery (COD) */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 sm:p-5 cursor-pointer transition-all border active:scale-[0.99] ${
                  paymentMethod === 'COD'
                    ? 'border-neutral-900 bg-neutral-50/70 ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-neutral-900' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-neutral-900 font-serif">
                        Cash on Delivery (COD)
                      </span>
                      <span className="ml-2.5 text-[9px] bg-neutral-200 text-neutral-800 font-bold px-2 py-0.5 uppercase tracking-wider font-sans inline-block">
                        STANDARD COURIER DISPATCH: ₹150
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 mt-2 font-serif leading-relaxed">
                  Pay cash or scan QR at your doorstep upon parcel arrival.
                </p>
              </div>
            </div>
          </div>

          {/* PRIMARY ORDER SUBMIT ACTION BUTTON (Image 1 style) */}
          <div className="pt-4">
            {paymentMethod === 'ONLINE' ? (
              <button
                type="button"
                onClick={handleProceedToCashfreePayment}
                disabled={isProcessing}
                className="w-full bg-black hover:bg-neutral-800 active:scale-[0.98] text-white py-4 px-6 text-xs font-serif font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>CONNECTING TO CASHFREE SECURE CHECKOUT...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>REVIEW & PAY VIA CASHFREE • ₹{finalPayable.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmCodOrder}
                disabled={isProcessing}
                className="w-full bg-black hover:bg-neutral-800 active:scale-[0.98] text-white py-4 px-6 text-xs font-serif font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-sm"
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

        </div>

        {/* RIGHT COLUMN: STICKY ORDER SUMMARY (Image 1 style) */}
        <div className="hidden lg:block">
          <div className="border border-neutral-200 p-6 lg:p-7 sticky top-6 space-y-6 bg-white shadow-xs">
            
            {/* Header: ORDER (items) & Edit bag link */}
            <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-neutral-900">
                ORDER ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </h3>
              <button
                type="button"
                onClick={() => setActivePage('cart')}
                className="text-xs font-serif underline text-neutral-600 hover:text-black cursor-pointer active:scale-95"
              >
                Edit bag
              </button>
            </div>

            {/* Products List (Image 1 layout: Image, Title, Item Code, Color, Qty, Price) */}
            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.selectedColor || ''}-${item.selectedSize || ''}`} className="py-4 flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 aspect-[3/4] bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 text-xs font-serif">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block font-sans">
                      DIVACHIC COUTURE
                    </span>
                    <h4 className="font-medium text-neutral-900 line-clamp-1 mt-0.5">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                      Item: DC_{item.productId.slice(0, 6).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Color: {item.selectedColor ? item.selectedColor.toUpperCase() : 'ATELIER SPECIAL'}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}
                    </p>
                    <span className="font-bold text-neutral-900 mt-2 block">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-neutral-200 pt-4 space-y-2.5 text-xs font-serif">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({cartCount} items)</span>
                <span className="text-neutral-900 font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Estimated Tax</span>
                <span className="text-neutral-900 font-medium">₹0.00</span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Estimated Shipping</span>
                {paymentMethod === 'ONLINE' ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span>₹0.00</span>
                    <span className="line-through text-neutral-400 text-[11px] font-normal">₹150.00</span>
                  </span>
                ) : (
                  <span className="text-neutral-900 font-medium">₹150.00</span>
                )}
              </div>

              {packagingFee > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>BG Signature Packaging</span>
                  <span className="text-neutral-900 font-medium">₹{packagingFee.toFixed(2)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Applied Promo ({appliedCoupon?.code || 'Voucher'})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Total Row */}
              <div className="flex justify-between items-baseline pt-4 border-t border-neutral-200">
                <span className="font-bold text-sm uppercase text-neutral-900">
                  Total
                </span>
                <span className="text-xl font-bold font-serif text-neutral-900">
                  ₹{finalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Note as seen in Bergdorf Goodman */}
            <p className="text-[11px] text-neutral-500 text-center font-serif leading-relaxed border-t border-neutral-100 pt-3">
              You can review and confirm your order in the next step
            </p>

            {/* OFFICIAL LOGISTICS & PAYMENT TRUST CARD */}
            <div className="bg-[#FAF9F6] border border-neutral-200 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 font-serif">
                  VERIFIED TRUST & FULFILLMENT
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>100% Guaranteed</span>
                </div>
              </div>

              {/* Shiprocket Delivery & Returns Badge */}
              <div className="flex items-center gap-3 p-2 bg-white rounded-xs border border-neutral-200/80">
                <div className="bg-[#2e0954] p-1.5 rounded-xs border border-purple-300/30 flex items-center shadow-xs shrink-0">
                  <img
                    src="/shiprocket-logo.png"
                    alt="Shiprocket Official Delivery Partner"
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div className="text-[10px] text-neutral-600 font-serif leading-tight">
                  <strong className="text-neutral-900 block font-sans text-[11px]">Delivery Done by Shiprocket</strong>
                  <span className="text-emerald-700 font-semibold">Free Doorstep Pickup on Returns (Up to 7 Days)</span>
                </div>
              </div>

              {/* Cashfree Payment Gateway Badge */}
              <div className="flex items-center gap-3 p-2 bg-white rounded-xs border border-neutral-200/80">
                <div className="bg-[#120F24] px-2.5 py-1.5 rounded-xs border border-[#2A2347] flex items-center shadow-xs shrink-0">
                  <img
                    src="/cashfree-payments.png"
                    alt="Cashfree Payments Verified Partner"
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <div className="text-[10px] text-neutral-600 font-serif leading-tight">
                  <strong className="text-neutral-900 block font-sans text-[11px]">100% RBI Authorized Cashfree</strong>
                  Bank-Grade 256-Bit SSL Instant Verification
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[10px] text-neutral-500 font-serif">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-700" />
                  <span>Dispatches in 24-48 Hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-neutral-700" />
                  <span>Insured Express Courier</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 4. FOOTER (Image 1 style: Privacy Policy, Terms of Use, Copyright) */}
      <div className="bg-black text-white py-6 px-4 lg:px-8 mt-12 sm:mt-16 border-t border-neutral-800 mb-safe">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif text-neutral-400">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActivePage('privacy-policy' as any)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActivePage('terms-conditions' as any)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
          </div>
          <div>
            <span>DivaChic © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
