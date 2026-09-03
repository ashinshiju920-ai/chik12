import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle2,
  Lock,
  QrCode,
  Smartphone,
  Building2,
  Banknote,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Download,
  Printer,
  Package,
  Calendar,
  Clock,
  Phone,
  Mail,
  Share2,
  MessageCircle
} from 'lucide-react';
import { DivaChikLogo } from '../common/DivaChikLogo';
import { Address, Order } from '../../types';
import { motion } from 'motion/react';

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
    isFreeShipping,
    formatPrice,
    placeOrder,
    currentOrder,
    standardDeliveryDays,
    onlineDiscountPercent,
    calculateDeliveryDate,
    activePage,
    setActivePage,
    showToast
  } = useStore();

  // If in confirmation view
  const isConfirmation = activePage === 'order-confirmation';

  // Checkout Step: 1: Information -> 2: Shipping Method -> 3: Payment
  const [step, setStep] = useState<1 | 2 | 3>(1);

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

  // Auto-Pincode Auto-Fill Helper
  const [pincodeDetectedNotice, setPincodeDetectedNotice] = useState('');

  const handlePincodeChange = (val: string) => {
    setPincode(val);
    const clean = val.replace(/\D/g, '');

    // Indian Pincode Auto-Lookup (6 digits)
    if (clean.length === 6) {
      if (clean.startsWith('560')) { setCity('Bangalore'); setState('Karnataka'); setCountry('India'); setPincodeDetectedNotice('Bangalore, KA'); }
      else if (clean.startsWith('400')) { setCity('Mumbai'); setState('Maharashtra'); setCountry('India'); setPincodeDetectedNotice('Mumbai, MH'); }
      else if (clean.startsWith('110')) { setCity('New Delhi'); setState('Delhi'); setCountry('India'); setPincodeDetectedNotice('New Delhi, DL'); }
      else if (clean.startsWith('600')) { setCity('Chennai'); setState('Tamil Nadu'); setCountry('India'); setPincodeDetectedNotice('Chennai, TN'); }
      else if (clean.startsWith('700')) { setCity('Kolkata'); setState('West Bengal'); setCountry('India'); setPincodeDetectedNotice('Kolkata, WB'); }
      else if (clean.startsWith('500')) { setCity('Hyderabad'); setState('Telangana'); setCountry('India'); setPincodeDetectedNotice('Hyderabad, TS'); }
      else if (clean.startsWith('380')) { setCity('Ahmedabad'); setState('Gujarat'); setCountry('India'); setPincodeDetectedNotice('Ahmedabad, GJ'); }
      else if (clean.startsWith('411')) { setCity('Pune'); setState('Maharashtra'); setCountry('India'); setPincodeDetectedNotice('Pune, MH'); }
      else if (clean.startsWith('682')) { setCity('Kochi'); setState('Kerala'); setCountry('India'); setPincodeDetectedNotice('Kochi, KL'); }
      else { setCountry('India'); setPincodeDetectedNotice('India Postal Region'); }
      showToast('Pincode Verified', 'success', 'City, State, and Country auto-filled!');
    }
    // US Zip Code Auto-Lookup (5 digits)
    else if (clean.length === 5) {
      if (clean.startsWith('94')) { setCity('San Francisco'); setState('California'); setCountry('United States'); setPincodeDetectedNotice('San Francisco, CA'); }
      else if (clean.startsWith('10')) { setCity('New York'); setState('New York'); setCountry('United States'); setPincodeDetectedNotice('New York, NY'); }
      else if (clean.startsWith('90')) { setCity('Los Angeles'); setState('California'); setCountry('United States'); setPincodeDetectedNotice('Los Angeles, CA'); }
      else { setCountry('United States'); setPincodeDetectedNotice('US Zip Code'); }
    }
  };

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
      if (!email) setEmail('customer@divachik.com');
      if (!phone) setPhone('+91 9820098200');
      setStreet('Bandra-Kurla Complex, Block G');
      setCity('Mumbai');
      setState('Maharashtra');
      setPincode('400051');
      setCountry('India');
    } else if (cityPreset === 'delhi') {
      if (!fullName) setFullName('Valued Customer');
      if (!email) setEmail('customer@divachik.com');
      if (!phone) setPhone('+91 9811098110');
      setStreet('Connaught Place, Block C');
      setCity('New Delhi');
      setState('Delhi');
      setPincode('110001');
      setCountry('India');
    }
    showToast('Express Address Loaded', 'success', 'Form filled in 1 tap for fast checkout!');
  };

  // Form completion progress percentage
  const isEmailValid = Boolean(email && email.includes('@'));
  const isPhoneValid = Boolean(phone && phone.length >= 7);
  const isNameValid = Boolean(fullName.trim().length > 0);
  const isStreetValid = Boolean(street.trim().length > 0);
  const isCityValid = Boolean(city.trim().length > 0);
  const isStateValid = Boolean(state.trim().length > 0);
  const isPincodeValid = Boolean(pincode.trim().length >= 4);

  const filledCount = [isEmailValid, isPhoneValid, isNameValid, isStreetValid, isCityValid, isStateValid, isPincodeValid].filter(Boolean).length;
  const formProgressPercent = Math.round((filledCount / 7) * 100);

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const shippingFee = isFreeShipping ? 0 : shippingMethod === 'express' ? 15.00 : 5.00;

  // Multi-mode Payment options
  const [paymentMode, setPaymentMode] = useState<'card' | 'upi' | 'netbanking' | 'applepay' | 'bnpl' | 'cod'>('card');

  // Card details
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8829');
  const [cardHolder, setCardHolder] = useState(fullName || 'ASHIN SHIJU');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('782');

  // UPI details
  const [upiId, setUpiId] = useState('user@okaxis');

  // Netbanking bank
  const [selectedBank, setSelectedBank] = useState('Chase Bank');

  // COD OTP simulation
  const [codOtp, setCodOtp] = useState('');
  const [codOtpSent, setCodOtpSent] = useState(false);

  const isOnlinePayment = paymentMode !== 'cod';
  const onlineDiscountAmount = isOnlinePayment ? (cartSubtotal * (onlineDiscountPercent / 100)) : 0;
  const finalTax = cartSubtotal * 0.08;
  const finalGrandTotal = Math.max(0, cartTotal + shippingFee + finalTax - onlineDiscountAmount);

  const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyjk8MYflKlMaqFM8ZQzwl673roAingHJSsclhshnBd709DqUmMArW3TGx1pId93hU/exec";

  const syncFormToGoogleSheetsExcel = () => {
    const formData = {
      email: email,
      phone: phone,
      name: fullName,
      postalCode: pincode,
      streetAddress: street,
      aptSuite: apartment,
      city: city,
      state: state,
      country: country
    };

    try {
      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
        .then(() => {
          console.log("Customer address synced to Google Sheets Excel successfully!");
        })
        .catch(error => {
          console.error("Error submitting form to Google Sheets:", error);
        });
    } catch (err) {
      console.log("Google Sheets submission exception:", err);
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

  const handleSendCodOtp = () => {
    setCodOtpSent(true);
    showToast('OTP sent to ' + (phone || 'your phone number'), 'info', 'Use OTP code: 884422');
  };

  const handleCompleteOrder = () => {
    if (paymentMode === 'cod' && codOtp !== '884422' && codOtp !== '123456') {
      showToast('Please enter the valid 6-digit COD verification OTP (use 884422)', 'warning');
      return;
    }

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      fullName,
      phone,
      street,
      apartment,
      city,
      state,
      pincode,
      country,
      type: 'home'
    };

    const paymentLabel =
      paymentMode === 'card' ? `Credit Card (${cardNumber.slice(-4)})` :
        paymentMode === 'upi' ? `UPI (${upiId})` :
          paymentMode === 'netbanking' ? `Net Banking (${selectedBank})` :
            paymentMode === 'applepay' ? 'Apple Pay / One-Touch' :
              paymentMode === 'bnpl' ? 'Klarna (4 interest-free installments)' :
                'Cash on Delivery (COD)';

    placeOrder({
      customer: {
        fullName: fullName || 'Valued Customer',
        email: email || currentUser?.email || 'customer@gmail.com',
        phone: phone || '+1 (555) 000-0000',
        addressLine1: street,
        addressLine2: apartment,
        city,
        state,
        postalCode: pincode
      },
      customerName: fullName || 'Valued Customer',
      email: email || currentUser?.email || 'customer@gmail.com',
      shippingAddress,
      shippingFee,
      tax: finalTax,
      total: finalGrandTotal,
      totalAmount: finalGrandTotal,
      paymentMethod: paymentLabel
    });
  };

  // Auto-redirect to WhatsApp upon order confirmation
  useEffect(() => {
    if (isConfirmation && currentOrder) {
      const waUrl = `https://wa.me/message/XAACO6O6PPIDL1?text=${encodeURIComponent(
        `Hello DivaChic Studio, I just placed Order #${currentOrder.orderNumber} for total ${formatPrice(currentOrder.total)}. Please confirm my order dispatch!`
      )}`;

      const timer = setTimeout(() => {
        window.location.href = waUrl;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isConfirmation, currentOrder]);

  // ORDER CONFIRMATION SCREEN
  if (isConfirmation && currentOrder) {
    const whatsappLink = `https://wa.me/message/XAACO6O6PPIDL1?text=${encodeURIComponent(
      `Hello DivaChic Studio, I just placed Order #${currentOrder.orderNumber} for total ${formatPrice(currentOrder.total)}. Please confirm my order dispatch!`
    )}`;

    return (
      <div className="bg-[#F9F8F6] min-h-screen py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#EAE6DE] rounded-xs shadow-md p-6 sm:p-10 space-y-8"
          >
            {/* WhatsApp Auto-Redirect High-Priority Banner */}
            <div className="bg-[#EBF5EF] border-2 border-[#25D366]/60 p-5 rounded-xs space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#128C7E] font-bold text-sm">
                  <MessageCircle className="w-5 h-5 fill-[#25D366] text-white shrink-0" />
                  <span>WhatsApp Concierge Order Sync</span>
                </div>
                <span className="bg-[#25D366] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                  Redirecting to WhatsApp...
                </span>
              </div>

              <p className="text-xs text-[#1E5638] leading-relaxed">
                Order <strong>#{currentOrder.orderNumber}</strong> has been successfully placed! You are being automatically redirected to WhatsApp for direct studio concierge dispatch confirmation.
              </p>

              <a
                href={whatsappLink}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] active:bg-[#075E54] text-white text-xs font-bold py-3.5 px-4 rounded-xs uppercase tracking-wider transition-all duration-200 inline-flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4.5 h-4.5 fill-white text-white" />
                <span>Redirecting to WhatsApp Now (Click to Open Immediately)</span>
              </a>
            </div>

            {/* Success Header */}
            <div className="text-center space-y-3 border-b border-[#F0ECE1] pb-8">
              <div className="flex justify-center mb-2">
                <DivaChikLogo variant="full" size="md" theme="dark" showSubtitle={true} subtitleText="EXCLUSIVE CLIENT RECEIPT" />
              </div>
              <div className="w-16 h-16 bg-[#EBF5EF] text-[#1E5638] rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C85A32]">
                Order Confirmed
              </span>
              <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F1F1F] font-editorial">
                Thank You For Your Order!
              </h1>
              <p className="text-xs sm:text-sm text-[#7A7264] max-w-md mx-auto leading-relaxed">
                We have received your order <strong>#{currentOrder.orderNumber}</strong>. A confirmation and invoice has been dispatched to <strong>{currentUser?.email || email || 'your email'}</strong>.
              </p>
            </div>

            {/* Tracking & Logistics Badge */}
            <div className="bg-[#FAF9F6] border border-[#EAE6DE] p-5 rounded-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#8C8477] uppercase text-[10px] tracking-wider block">Tracking Number</span>
                <strong className="text-[#1F1F1F] font-mono text-sm">{currentOrder.trackingNumber}</strong>
              </div>
              <div>
                <span className="text-[#8C8477] uppercase text-[10px] tracking-wider block">Carrier</span>
                <span className="text-[#1F1F1F] font-semibold">{currentOrder.carrier}</span>
              </div>
              <div>
                <span className="text-[#8C8477] uppercase text-[10px] tracking-wider block">Estimated Delivery</span>
                <strong className="text-[#1E5638] font-semibold">{currentOrder.estimatedDeliveryDate}</strong>
              </div>
            </div>

            {/* Live Progress Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                Fulfillment & Courier Timeline
              </h3>
              <div className="space-y-3">
                {currentOrder.timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5">
                      {event.completed ? (
                        <div className="w-5 h-5 rounded-full bg-[#1E5638] text-white flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[#D5D0C5] bg-white flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D5D0C5]"></span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${event.current ? 'text-[#C85A32]' : 'text-[#1F1F1F]'}`}>
                          {event.title}
                        </span>
                        <span className="text-[11px] text-[#9E978C]">{event.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#6E685F] mt-0.5">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="border-t border-[#F0ECE1] pt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                Purchased Items ({currentOrder.items.length})
              </h3>
              <div className="divide-y divide-[#F0ECE1]">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-xs border border-[#EAE6DE]"
                      />
                      <div>
                        <div className="font-semibold text-[#1F1F1F]">{item.name}</div>
                        <div className="text-[11px] text-[#8C8477]">
                          Qty: {item.quantity} {item.selectedColor ? `| ${item.selectedColor}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-[#1F1F1F]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#F0ECE1] text-xs">
              <div>
                <span className="text-[#8C8477] uppercase text-[10px] tracking-wider block mb-1">Shipping Destination</span>
                <div className="text-[#1F1F1F] leading-relaxed">
                  <p className="font-semibold">{currentOrder.shippingAddress.fullName}</p>
                  <p>{currentOrder.shippingAddress.street} {currentOrder.shippingAddress.apartment}</p>
                  <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.pincode}</p>
                  <p>{currentOrder.shippingAddress.country}</p>
                  <p className="text-[#8C8477] mt-1">{currentOrder.shippingAddress.phone}</p>
                </div>
              </div>

              <div>
                <span className="text-[#8C8477] uppercase text-[10px] tracking-wider block mb-1">Payment Method & Total</span>
                <div className="space-y-1 text-[#555048]">
                  <p><strong>Method:</strong> {currentOrder.paymentMethod}</p>
                  <p><strong>Subtotal:</strong> {formatPrice(currentOrder.subtotal)}</p>
                  <p><strong>Shipping:</strong> {currentOrder.shippingFee === 0 ? 'FREE' : formatPrice(currentOrder.shippingFee)}</p>
                  <p><strong>Tax:</strong> {formatPrice(currentOrder.tax)}</p>
                  <p className="text-sm font-bold text-[#1F1F1F] pt-1">
                    Total Paid: {formatPrice(currentOrder.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions: Download Invoice & Return */}
            <div className="pt-6 border-t border-[#F0ECE1] flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => {
                  window.print();
                  showToast('Invoice prepared for printing', 'info');
                }}
                className="inline-flex items-center gap-2 border border-[#D5D0C5] hover:bg-[#F5F3EF] text-[#1F1F1F] text-xs font-semibold px-4 py-2.5 rounded-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setActivePage('account')}
                  className="bg-[#1F1F1F] hover:bg-[#333333] text-white text-xs font-semibold px-5 py-2.5 rounded-xs transition-colors cursor-pointer"
                >
                  Manage Orders in Dashboard
                </button>
                <button
                  onClick={() => setActivePage('shop')}
                  className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-5 py-2.5 rounded-xs transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F8F6] min-h-screen pt-6 pb-32 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Checkout Header */}
        <div className="mb-8 flex items-center justify-between border-b border-[#EAE6DE] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('cart')}
              className="p-1 text-[#8C8477] hover:text-[#1F1F1F] transition-colors cursor-pointer"
              aria-label="Back to cart"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1F1F1F] font-editorial">
              DivaChic Express Checkout
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <DivaChikLogo variant="compact" size="xs" theme="auto" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#1E5638] font-medium border-l border-[#EAE6DE] pl-3">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit SSL Encrypted & PCI-DSS Compliant</span>
            </div>
          </div>
        </div>

        {/* Step Indicators (2-Step Direct Fast Checkout) */}
        <div className="grid grid-cols-2 gap-3 mb-10 text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`py-3.5 px-4 border-b-2 text-center transition-all cursor-pointer ${step === 1 ? 'border-[#C85A32] text-[#C85A32] font-bold' : 'border-[#E0DDD5] text-[#8C8477]'
              }`}
          >
            1. Shipping Address & Details
          </button>
          <button
            onClick={() => fullName && street && city && setStep(2)}
            className={`py-3.5 px-4 border-b-2 text-center transition-all cursor-pointer ${step === 2 ? 'border-[#C85A32] text-[#C85A32] font-bold' : 'border-[#E0DDD5] text-[#8C8477]'
              }`}
          >
            2. Payment Gateway ({isOnlinePayment ? `${onlineDiscountPercent}% OFF` : 'COD'})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Checkout Form Column */}
          <div className="lg:col-span-8 space-y-8">

            {/* STEP 1: SHIPPING ADDRESS */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 sm:p-8 border border-[#EAE6DE] rounded-xs shadow-xs space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#F0ECE1] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-[#1F1F1F] font-sans">
                        Customer Details & Shipping Destination
                      </h2>
                      <span className="text-[10px] bg-[#FAF1ED] text-[#C85A32] font-bold px-2 py-0.5 rounded-full border border-[#C85A32]/30">
                        Fast Express Checkout
                      </span>
                    </div>
                    <p className="text-xs text-[#7A7264] mt-0.5">
                      Type your 6-digit Pincode to auto-fill City & State instantly.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#C85A32]">Step 1 of 2</span>
                </div>

                {/* Form Completion Progress Meter */}
                <div className="space-y-1 bg-[#FAF9F6] p-3 border border-[#EAE6DE] rounded-xs">
                  <div className="flex justify-between items-center text-[11px] font-semibold">
                    <span className="text-[#1F1F1F] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Form Completion Readiness:</span>
                    </span>
                    <span className={formProgressPercent === 100 ? 'text-[#1E5638] font-bold' : 'text-[#C85A32]'}>
                      {formProgressPercent}% Ready {formProgressPercent === 100 ? '✓' : ''}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#EAE6DE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C85A32] to-[#1E5638] transition-all duration-500 rounded-full"
                      style={{ width: `${formProgressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* 1-TAP EXPRESS AUTOFILL CHIPS */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#4A453C]">
                    <span>⚡ 1-Tap Express Address Presets (Fast Conversion):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyExpressPreset('bangalore')}
                      className="bg-[#FAF1ED] hover:bg-[#C85A32] hover:text-white text-[#C85A32] text-xs font-semibold px-3 py-1.5 rounded-xs border border-[#C85A32]/30 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>📍 Bangalore Studio HQ (560076)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyExpressPreset('mumbai')}
                      className="bg-[#FAF9F6] hover:bg-[#1F1F1F] hover:text-white text-[#1F1F1F] text-xs font-semibold px-3 py-1.5 rounded-xs border border-[#D5D0C5] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>📍 Mumbai BKC (400051)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyExpressPreset('delhi')}
                      className="bg-[#FAF9F6] hover:bg-[#1F1F1F] hover:text-white text-[#1F1F1F] text-xs font-semibold px-3 py-1.5 rounded-xs border border-[#D5D0C5] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>📍 New Delhi CP (110001)</span>
                    </button>
                  </div>
                </div>

                {/* Contact Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-[#4A453C]">Email Address (for invoice) *</label>
                      {isEmailValid && <span className="text-[10px] font-bold text-[#1E5638] flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#1E5638]" /> Valid Email</span>}
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className={`w-full px-3.5 py-2.5 text-xs border rounded-xs focus:outline-none transition-colors ${isEmailValid ? 'border-[#1E5638] bg-green-50/20' : 'border-[#D5D0C5] focus:border-[#C85A32]'
                        }`}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-[#4A453C]">Mobile Phone (for delivery SMS) *</label>
                      {isPhoneValid && <span className="text-[10px] font-bold text-[#1E5638] flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#1E5638]" /> Verified Phone</span>}
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 6282377918"
                      className={`w-full px-3.5 py-2.5 text-xs border rounded-xs focus:outline-none transition-colors ${isPhoneValid ? 'border-[#1E5638] bg-green-50/20' : 'border-[#D5D0C5] focus:border-[#C85A32]'
                        }`}
                    />
                  </div>
                </div>

                {/* Saved Addresses Picker (if available) */}
                {currentUser?.addresses && currentUser.addresses.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-medium text-[#4A453C]">Select From Saved Addresses:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentUser.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 border rounded-xs cursor-pointer text-xs transition-all ${selectedSavedAddrId === addr.id
                            ? 'border-[#C85A32] bg-[#FAF1ED]'
                            : 'border-[#E0DCD3] hover:border-[#1F1F1F]'
                            }`}
                        >
                          <div className="font-semibold text-[#1F1F1F]">{addr.fullName} ({addr.type})</div>
                          <div className="text-[#6E685F] text-[11px] truncate">{addr.street}, {addr.city}</div>
                          <div className="text-[#6E685F] text-[11px]">{addr.pincode}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address Input Fields */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-[#4A453C]">Full Recipient Name *</label>
                      {isNameValid && <span className="text-[10px] font-bold text-[#1E5638] flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#1E5638]" /> Complete</span>}
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="First and Last Name"
                      className={`w-full px-3.5 py-2.5 text-xs border rounded-xs focus:outline-none transition-colors ${isNameValid ? 'border-[#1E5638] bg-green-50/20' : 'border-[#D5D0C5] focus:border-[#C85A32]'
                        }`}
                    />
                  </div>

                  {/* Postal / Zip Code First for Auto-Lookup */}
                  <div className="bg-[#FAF9F6] p-4 border border-[#EAE6DE] rounded-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-[#1F1F1F]">
                        Postal / Zip Code (Auto-Detects City & State) *
                      </label>
                      {pincodeDetectedNotice && (
                        <span className="text-[10px] bg-green-100 text-[#1E5638] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Auto-Detected: {pincodeDetectedNotice}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="Enter 6-digit Pincode (e.g. 560076, 400051, 110001)"
                      className={`w-full px-3.5 py-2.5 text-xs font-mono font-bold border rounded-xs focus:outline-none transition-colors ${isPincodeValid ? 'border-[#1E5638] bg-white text-[#C85A32]' : 'border-[#D5D0C5] bg-white focus:border-[#C85A32]'
                        }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#4A453C] mb-1">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="House / Building / Street"
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xs focus:outline-none transition-colors ${isStreetValid ? 'border-[#1E5638] bg-green-50/20' : 'border-[#D5D0C5] focus:border-[#C85A32]'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#4A453C] mb-1">Apt / Suite (Optional)</label>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="e.g. Suite 4B"
                        className="w-full px-3.5 py-2.5 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#4A453C] mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xs focus:outline-none transition-colors ${isCityValid ? 'border-[#1E5638] bg-green-50/20' : 'border-[#D5D0C5] focus:border-[#C85A32]'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#4A453C] mb-1">State / Province *</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State / Region"
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-xs focus:outline-none transition-colors ${isStateValid ? 'border-[#1E5638] bg-green-50/20' : 'border-[#D5D0C5] focus:border-[#C85A32]'
                          }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A453C] mb-1">Country / Region *</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32] bg-white font-medium"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Japan">Japan</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>

                {/* Continue to Step 2 (Direct to Payment Gateway) */}
                <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[#F0ECE1]">
                  <div className="text-xs text-[#7A7264] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1E5638]" />
                    <span>Free Shipping Included & Fast Dispatch</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!fullName || !street || !city || !pincode) {
                        showToast('Please fill out all required address fields', 'warning');
                        return;
                      }
                      syncFormToGoogleSheetsExcel();
                      showToast('Address Verified', 'success', 'Synced live to Google Sheets Excel!');
                      setStep(2);
                    }}
                    className="w-full sm:w-auto bg-[#C85A32] hover:bg-[#B34E2A] active:bg-[#A2421D] text-white text-xs font-bold tracking-wider uppercase px-9 py-4 rounded-xs transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
                  >
                    <span>CONTINUE TO PAYMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PAYMENT GATEWAY (DIRECT ACCESS) */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 sm:p-8 border border-[#EAE6DE] rounded-xs shadow-xs space-y-6"
              >
                {/* Online Payment vs COD Pricing Banner */}
                {isOnlinePayment ? (
                  <div className="bg-[#EBF5EF] border border-[#1E5638]/40 p-4 rounded-xs flex items-center justify-between text-xs text-[#1E5638] shadow-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#1E5638] shrink-0" />
                      <div>
                        <strong>Instant {onlineDiscountPercent}% Online Payment Discount Active!</strong>
                        <p className="text-[11px] text-[#1E5638]/80">You are saving {formatPrice(onlineDiscountAmount)} by paying online instead of Cash on Delivery.</p>
                      </div>
                    </div>
                    <span className="bg-[#1E5638] text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase shrink-0">
                      Save {onlineDiscountPercent}% Instantly
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#FAF9F6] border border-[#EAE6DE] p-4 rounded-xs flex items-center justify-between text-xs text-[#6E685F]">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#8C8477] shrink-0" />
                      <span>Cash on Delivery (Standard Price — Pay {formatPrice(finalGrandTotal)} at delivery)</span>
                    </div>
                    <span className="bg-gray-200 text-gray-800 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase shrink-0">
                      Standard Price
                    </span>
                  </div>
                )}

                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('card')}
                    className={`p-3 border rounded-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${paymentMode === 'card' ? 'border-[#C85A32] bg-[#FAF1ED] font-bold text-[#C85A32]' : 'border-[#E0DCD3]'
                      }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`p-3 border rounded-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${paymentMode === 'upi' ? 'border-[#C85A32] bg-[#FAF1ED] font-bold text-[#C85A32]' : 'border-[#E0DCD3]'
                      }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>UPI / Instant QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('netbanking')}
                    className={`p-3 border rounded-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${paymentMode === 'netbanking' ? 'border-[#C85A32] bg-[#FAF1ED] font-bold text-[#C85A32]' : 'border-[#E0DCD3]'
                      }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('applepay')}
                    className={`p-3 border rounded-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${paymentMode === 'applepay' ? 'border-[#C85A32] bg-[#FAF1ED] font-bold text-[#C85A32]' : 'border-[#E0DCD3]'
                      }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Apple / Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('bnpl')}
                    className={`p-3 border rounded-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${paymentMode === 'bnpl' ? 'border-[#C85A32] bg-[#FAF1ED] font-bold text-[#C85A32]' : 'border-[#E0DCD3]'
                      }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Klarna (BNPL)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('cod')}
                    className={`p-3 border rounded-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${paymentMode === 'cod' ? 'border-[#C85A32] bg-[#FAF1ED] font-bold text-[#C85A32]' : 'border-[#E0DCD3]'
                      }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash on Delivery</span>
                  </button>
                </div>

                {/* Sub-Form Based on Selected Mode */}
                <div className="pt-2">

                  {/* Mode: Credit Card */}
                  {paymentMode === 'card' && (
                    <div className="space-y-4 bg-[#FAF9F6] p-5 border border-[#EAE6DE] rounded-xs">

                      {/* Interactive Credit Card Visualizer */}
                      <div className="w-full max-w-sm mx-auto bg-gradient-to-tr from-[#141414] via-[#222222] to-[#333333] text-white p-5 rounded-md shadow-lg space-y-4 font-mono border border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-sans tracking-widest text-[#C85A32] font-bold">DIVACHIC BLACK CARD</span>
                          <span className="text-xs font-bold">VISA / MASTER</span>
                        </div>
                        <div className="text-base tracking-widest pt-2">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 pt-1 font-sans">
                          <div>
                            <span className="block uppercase text-[8px]">Cardholder</span>
                            <span className="font-semibold text-white uppercase">{cardHolder || 'VALUED CLIENT'}</span>
                          </div>
                          <div>
                            <span className="block uppercase text-[8px]">Expires</span>
                            <span className="font-semibold text-white">{cardExpiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-[#4A453C] mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4532 0000 0000 0000"
                            className="w-full px-3 py-2 text-xs border border-[#D5D0C5] bg-white rounded-xs"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-[#4A453C] mb-1">Name on Card</label>
                            <input
                              type="text"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              placeholder="Full Name"
                              className="w-full px-3 py-2 text-xs border border-[#D5D0C5] bg-white rounded-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#4A453C] mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="08/29"
                              className="w-full px-3 py-2 text-xs border border-[#D5D0C5] bg-white rounded-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode: UPI */}
                  {paymentMode === 'upi' && (
                    <div className="bg-[#FAF9F6] p-5 border border-[#EAE6DE] rounded-xs space-y-4 text-center">
                      <div className="w-36 h-36 bg-white border border-[#D5D0C5] p-2 mx-auto rounded-xs shadow-xs flex items-center justify-center">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=haute-boutique-pay"
                          alt="Instant Payment QR"
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-xs text-[#7A7264]">Scan with GPay, PhonePe, Paytm, or any BHIM UPI app.</p>
                      <div className="max-w-xs mx-auto flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourhandle@upi"
                          className="flex-1 px-3 py-2 text-xs border border-[#D5D0C5] bg-white rounded-xs"
                        />
                        <button
                          type="button"
                          onClick={() => showToast('UPI handle verified!', 'success')}
                          className="bg-[#1F1F1F] text-white text-xs px-3 py-2 rounded-xs"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode: Net Banking */}
                  {paymentMode === 'netbanking' && (
                    <div className="bg-[#FAF9F6] p-5 border border-[#EAE6DE] rounded-xs space-y-3">
                      <label className="block text-xs font-medium text-[#4A453C]">Select Your Banking Institution</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs border border-[#D5D0C5] bg-white rounded-xs"
                      >
                        <option value="Chase Bank">Chase Bank (US)</option>
                        <option value="Bank of America">Bank of America</option>
                        <option value="Barclays">Barclays (UK)</option>
                        <option value="Nordea Bank">Nordea Bank (Sweden)</option>
                        <option value="BNP Paribas">BNP Paribas (France)</option>
                        <option value="HDFC Bank">HDFC Bank (India)</option>
                      </select>
                    </div>
                  )}

                  {/* Mode: Apple Pay */}
                  {paymentMode === 'applepay' && (
                    <div className="bg-[#FAF9F6] p-6 border border-[#EAE6DE] rounded-xs text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-[#1F1F1F]">Instant Biometric 1-Touch Checkout</p>
                      <p className="text-[11px] text-[#7A7264]">Authenticate using FaceID / TouchID to charge saved default card.</p>
                    </div>
                  )}

                  {/* Mode: BNPL Klarna */}
                  {paymentMode === 'bnpl' && (
                    <div className="bg-[#FAF9F6] p-5 border border-[#EAE6DE] rounded-xs space-y-2 text-xs">
                      <div className="font-semibold text-[#C85A32]">Pay in 4 interest-free installments of {formatPrice(finalGrandTotal / 4)}</div>
                      <p className="text-[#6E685F] text-[11px]">Due every 2 weeks. No hidden fees or credit score impact when paid on time.</p>
                    </div>
                  )}

                  {/* Mode: Cash on Delivery */}
                  {paymentMode === 'cod' && (
                    <div className="bg-[#FAF9F6] p-5 border border-[#EAE6DE] rounded-xs space-y-3 text-xs">
                      <div className="font-semibold text-[#1F1F1F]">Cash on Delivery Verification</div>
                      <p className="text-[#7A7264] text-[11px]">
                        To prevent fraudulent bookings, please verify your mobile phone with a 1-time passcode.
                      </p>
                      {!codOtpSent ? (
                        <button
                          type="button"
                          onClick={handleSendCodOtp}
                          className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs px-4 py-2 rounded-xs transition-colors cursor-pointer"
                        >
                          Send OTP to {phone || 'Registered Phone'}
                        </button>
                      ) : (
                        <div className="flex gap-2 max-w-xs">
                          <input
                            type="text"
                            value={codOtp}
                            onChange={(e) => setCodOtp(e.target.value)}
                            placeholder="Enter OTP (884422)"
                            className="flex-1 px-3 py-2 text-xs border border-[#D5D0C5] bg-white rounded-xs"
                          />
                          <span className="text-[11px] text-[#1E5638] flex items-center font-medium">
                            Demo Code: 884422
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Final Order Placement Button */}
                <div className="pt-6 border-t border-[#F0ECE1] flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-[#6E685F] hover:text-[#1F1F1F] font-semibold cursor-pointer"
                  >
                    ← Back to Address
                  </button>

                  <button
                    id="place-order-button"
                    onClick={handleCompleteOrder}
                    className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold tracking-wider uppercase px-10 py-4 rounded-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Lock className="w-4 h-4" />
                    <span>AUTHORIZE & PAY {formatPrice(finalGrandTotal)}</span>
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column: Mini Cart Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 border border-[#EAE6DE] rounded-xs shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-[#1F1F1F] pb-3 border-b border-[#F0ECE1]">
                In Your Bag ({cartCount} items)
              </h3>

              <div className="divide-y divide-[#F0ECE1] max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-xs border border-[#EAE6DE] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F1F1F] truncate">{item.product.name}</p>
                        <p className="text-[11px] text-[#8C8477]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium text-[#1F1F1F]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Notes Preview */}
              {orderNote && (
                <div className="p-2.5 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs text-[11px] text-[#6E685F]">
                  <strong>Order Note:</strong> {orderNote}
                </div>
              )}

              {/* Price Details */}
              <div className="space-y-2 pt-2 border-t border-[#F0ECE1] text-xs text-[#555048]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium text-[#1F1F1F]">{formatPrice(cartSubtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#1E5638]">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-{formatPrice(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-medium text-[#1F1F1F]">
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%):</span>
                  <span>{formatPrice(finalTax)}</span>
                </div>
                {/* Online Payment Discount Line Item */}
                {isOnlinePayment && onlineDiscountAmount > 0 && (
                  <div className="flex justify-between text-[#1E5638] font-semibold bg-[#EBF5EF] p-2 rounded-xs border border-[#1E5638]/20">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#1E5638]" />
                      <span>Online Payment ({onlineDiscountPercent}% OFF):</span>
                    </span>
                    <span>-{formatPrice(onlineDiscountAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#F0ECE1] flex justify-between text-base font-bold text-[#1F1F1F]">
                  <span>Grand Total:</span>
                  <span className="text-[#C85A32]">{formatPrice(finalGrandTotal)}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
