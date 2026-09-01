import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  RotateCcw, 
  LogOut, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Printer, 
  ExternalLink,
  ShoppingBag,
  ShieldCheck
} from 'lucide-react';
import { Address } from '../../types';

export const AccountDashboard: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    wishlist, 
    products, 
    addToCart, 
    toggleWishlist, 
    logout, 
    saveAddress, 
    deleteAddress, 
    setDefaultAddress,
    formatPrice, 
    requestOrderReturn,
    openProductDetail,
    setActivePage,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'returns' | 'profile'>('orders');

  // New address modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newApartment, setNewApartment] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [newType, setNewType] = useState<'home' | 'work' | 'other'>('home');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Return request modal state
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('Size did not fit as expected');

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newStreet || !newCity || !newPincode) {
      showToast('Please fill out all mandatory address fields', 'warning');
      return;
    }

    saveAddress({
      fullName: newFullName,
      phone: newPhone || '+1 (555) 000-0000',
      street: newStreet,
      apartment: newApartment,
      city: newCity,
      state: newState,
      pincode: newPincode,
      country: newCountry,
      type: newType,
      isDefault: newIsDefault
    });

    setShowAddAddress(false);
    setNewFullName('');
    setNewPhone('');
    setNewStreet('');
    setNewApartment('');
    setNewCity('');
    setNewState('');
    setNewPincode('');
  };

  const handleConfirmReturn = (orderId: string) => {
    requestOrderReturn(orderId, returnReason);
    setSelectedOrderForReturn(null);
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-[#F9F8F6] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="bg-white border border-[#EAE6DE] rounded-xs p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-5">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
              alt={currentUser?.name || 'Customer'}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#C85A32]"
            />
            <div>
              <span className="text-[11px] font-bold text-[#C85A32] uppercase tracking-widest">
                Diva'Chik Privé VIP
              </span>
              <h1 className="text-2xl font-semibold text-[#1F1F1F] font-editorial">
                {currentUser?.name || 'Valued Member'}
              </h1>
              <p className="text-xs text-[#7A7264]">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 border border-[#D5D0C5] hover:bg-[#F5F3EF] text-[#1F1F1F] text-xs font-semibold px-4 py-2.5 rounded-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#EAE6DE] rounded-xs overflow-hidden shadow-xs divide-y divide-[#F0ECE1] text-xs font-medium">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  activeTab === 'orders' ? 'bg-[#FAF1ED] text-[#C85A32] font-bold' : 'text-[#524B42] hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>My Orders & Tracking</span>
                </div>
                <span className="text-[10px] bg-[#EFECE6] px-1.5 py-0.5 rounded-full">{orders.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  activeTab === 'addresses' ? 'bg-[#FAF1ED] text-[#C85A32] font-bold' : 'text-[#524B42] hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <span>Address Book</span>
                </div>
                <span className="text-[10px] bg-[#EFECE6] px-1.5 py-0.5 rounded-full">
                  {currentUser?.addresses.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  activeTab === 'wishlist' ? 'bg-[#FAF1ED] text-[#C85A32] font-bold' : 'text-[#524B42] hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4" />
                  <span>Saved Wishlist</span>
                </div>
                <span className="text-[10px] bg-[#EFECE6] px-1.5 py-0.5 rounded-full">{wishlist.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('returns')}
                className={`w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  activeTab === 'returns' ? 'bg-[#FAF1ED] text-[#C85A32] font-bold' : 'text-[#524B42] hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4" />
                  <span>Returns & Exchanges</span>
                </div>
              </button>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-9">
            
            {/* TAB 1: ORDERS & TRACKING */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-[#1F1F1F] font-editorial">
                    Order History & Courier Progress
                  </h2>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white p-12 border border-[#EAE6DE] rounded-xs text-center space-y-3">
                    <Package className="w-10 h-10 text-[#8C8477] mx-auto" />
                    <p className="text-sm font-semibold text-[#1F1F1F]">No past orders found.</p>
                    <button
                      onClick={() => setActivePage('shop')}
                      className="bg-[#C85A32] text-white text-xs px-5 py-2.5 rounded-xs"
                    >
                      Shop Collections
                    </button>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white border border-[#EAE6DE] rounded-xs shadow-xs p-6 space-y-5"
                    >
                      {/* Top bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0ECE1] text-xs">
                        <div>
                          <span className="text-[#8C8477]">Order Number: </span>
                          <strong className="text-[#1F1F1F] font-mono text-sm">#{ord.orderNumber}</strong>
                          <span className="text-[#8C8477] ml-2">({ord.date})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-xs font-semibold text-[11px] uppercase ${
                              ord.status === 'delivered'
                                ? 'bg-[#EBF5EF] text-[#1E5638]'
                                : ord.status === 'returned'
                                ? 'bg-orange-50 text-orange-700'
                                : 'bg-[#FAF1ED] text-[#C85A32]'
                            }`}
                          >
                            {ord.status.replace('_', ' ')}
                          </span>

                          <button
                            onClick={() => {
                              window.print();
                              showToast('Invoice printed', 'info');
                            }}
                            className="p-1 text-[#8C8477] hover:text-[#1F1F1F] cursor-pointer"
                            title="Print Tax Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-[#F0ECE1]">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-xs border border-[#EAE6DE]"
                              />
                              <div>
                                <p className="font-semibold text-[#1F1F1F]">{item.name}</p>
                                <p className="text-[11px] text-[#8C8477]">
                                  Qty: {item.quantity} {item.selectedColor ? `| ${item.selectedColor}` : ''}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-[#1F1F1F]">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Shipment Tracking Progress Bar */}
                      <div className="bg-[#FAF9F6] p-4 border border-[#EAE6DE] rounded-xs space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[#8C8477]">Carrier: </span>
                            <strong>{ord.carrier}</strong> | 
                            <span className="text-[#8C8477] ml-1">Track #: </span>
                            <span className="font-mono text-[#C85A32]">{ord.trackingNumber}</span>
                          </div>
                          <span className="text-[11px] text-[#1E5638] font-semibold">
                            Est. {ord.estimatedDeliveryDate}
                          </span>
                        </div>

                        {/* Visual Progress Steps */}
                        <div className="grid grid-cols-4 gap-1 pt-1 text-[10px] text-center">
                          <div className={`py-1 rounded-xs ${ord.status !== 'cancelled' ? 'bg-[#1E5638] text-white font-medium' : 'bg-gray-200'}`}>
                            Placed
                          </div>
                          <div className={`py-1 rounded-xs ${['packed', 'in_transit', 'out_for_delivery', 'delivered'].includes(ord.status) ? 'bg-[#1E5638] text-white font-medium' : 'bg-gray-200 text-gray-500'}`}>
                            Packed
                          </div>
                          <div className={`py-1 rounded-xs ${['in_transit', 'out_for_delivery', 'delivered'].includes(ord.status) ? 'bg-[#1E5638] text-white font-medium' : 'bg-gray-200 text-gray-500'}`}>
                            In Transit
                          </div>
                          <div className={`py-1 rounded-xs ${ord.status === 'delivered' ? 'bg-[#1E5638] text-white font-medium' : 'bg-gray-200 text-gray-500'}`}>
                            Delivered
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex justify-between items-center text-xs pt-1">
                        <div className="text-[#6E685F]">
                          Total: <strong className="text-[#1F1F1F] text-sm">{formatPrice(ord.total)}</strong>
                        </div>

                        {ord.status !== 'returned' && (
                          <button
                            onClick={() => setSelectedOrderForReturn(ord.id)}
                            className="text-[#C85A32] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Request Return / Exchange</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: ADDRESS BOOK */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-[#1F1F1F] font-editorial">
                    Saved Shipping & Billing Addresses
                  </h2>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold px-4 py-2 rounded-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* New Address Form Modal / Box */}
                {showAddAddress && (
                  <form onSubmit={handleSaveAddress} className="bg-white p-6 border border-[#C85A32]/40 rounded-xs space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                      Add New Delivery Destination
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          placeholder="First and Last Name"
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">Mobile Phone *</label>
                        <input
                          type="tel"
                          required
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={newStreet}
                          onChange={(e) => setNewStreet(e.target.value)}
                          placeholder="House & Street Name"
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">Apartment / Suite</label>
                        <input
                          type="text"
                          value={newApartment}
                          onChange={(e) => setNewApartment(e.target.value)}
                          placeholder="e.g. Unit 3"
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">State / Region *</label>
                        <input
                          type="text"
                          required
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#4A453C] mb-1">Postal / Zip Code *</label>
                        <input
                          type="text"
                          required
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 text-xs text-[#4A453C]">
                        <input
                          type="checkbox"
                          checked={newIsDefault}
                          onChange={(e) => setNewIsDefault(e.target.checked)}
                          className="text-[#C85A32] focus:ring-[#C85A32]"
                        />
                        <span>Set as Default Shipping Address</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-4 py-2 text-xs text-[#7A7264]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-6 py-2.5 rounded-xs uppercase tracking-wider"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser?.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 bg-white border rounded-xs relative space-y-2 text-xs ${
                        addr.isDefault ? 'border-[#C85A32] shadow-xs' : 'border-[#EAE6DE]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1F1F1F]">{addr.fullName}</span>
                          <span className="uppercase text-[10px] px-1.5 py-0.5 bg-[#F5F3EF] text-[#6E685F] font-bold rounded-xs">
                            {addr.type}
                          </span>
                        </div>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-[#FAF1ED] text-[#C85A32] px-2 py-0.5 font-bold rounded-xs">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-[#5C564C] leading-relaxed">
                        {addr.street} {addr.apartment}<br />
                        {addr.city}, {addr.state} {addr.pincode}<br />
                        {addr.country}
                      </p>
                      <p className="text-[#8C8477]">{addr.phone}</p>

                      <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[#C85A32] hover:underline cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="text-[#A0988A] hover:text-[#D32F2F] transition-colors ml-auto cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[#1F1F1F] font-editorial">
                  Saved Wishlist ({wishlistProducts.length})
                </h2>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white p-12 border border-[#EAE6DE] rounded-xs text-center space-y-3">
                    <Heart className="w-10 h-10 text-[#8C8477] mx-auto" />
                    <p className="text-sm font-semibold text-[#1F1F1F]">Your wishlist is empty.</p>
                    <button
                      onClick={() => setActivePage('shop')}
                      className="bg-[#C85A32] text-white text-xs px-5 py-2.5 rounded-xs"
                    >
                      Browse Boutique
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map((prod) => (
                      <div key={prod.id} className="bg-white border border-[#EAE6DE] rounded-xs p-4 flex flex-col justify-between space-y-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          onClick={() => openProductDetail(prod)}
                          className="w-full aspect-square object-cover rounded-xs cursor-pointer"
                        />
                        <div>
                          <h4 
                            onClick={() => openProductDetail(prod)}
                            className="text-xs font-semibold text-[#1F1F1F] hover:text-[#C85A32] cursor-pointer truncate"
                          >
                            {prod.name}
                          </h4>
                          <p className="text-xs font-bold text-[#1F1F1F] mt-1">{formatPrice(prod.price)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => addToCart(prod, 1)}
                            disabled={prod.isSoldOut}
                            className="flex-1 bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-[11px] font-semibold py-2 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{prod.isSoldOut ? 'Sold Out' : '+ Bag'}</span>
                          </button>
                          <button
                            onClick={() => toggleWishlist(prod.id)}
                            className="p-2 border border-[#D5D0C5] text-[#8C8477] hover:text-[#D32F2F] rounded-xs"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: RETURNS & EXCHANGES */}
            {activeTab === 'returns' && (
              <div className="bg-white p-6 sm:p-8 border border-[#EAE6DE] rounded-xs space-y-6">
                <h2 className="text-xl font-semibold text-[#1F1F1F] font-editorial">
                  Diva'Chik 7-Day Easy Return & Exchange Policy
                </h2>
                <div className="text-xs text-[#555048] space-y-3 leading-relaxed">
                  <p>
                    We offer 7 days of hassle-free returns and size exchanges on all unwashed and unworn garments, unused accessories, and pristine optical frames with original labels intact. Maximum return window is strictly 7 days from delivery date.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[#6E685F]">
                    <li>Pre-paid downloadable courier return labels generated immediately.</li>
                    <li>Refunds credited back to original payment gateway within 3 business days of receipt.</li>
                    <li>Store credit issued instantly with bonus 5% shopping allowance.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Return Request Modal */}
      {selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xs shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-[#1F1F1F]">
              Initiate Return Request
            </h3>
            <p className="text-xs text-[#7A7264]">
              Select reason for returning items from Order #{selectedOrderForReturn}:
            </p>

            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs bg-white"
            >
              <option value="Size did not fit as expected">Size did not fit as expected</option>
              <option value="Ordered incorrect color / model">Ordered incorrect color / model</option>
              <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
              <option value="Item arrived with defect">Item arrived with defect</option>
            </select>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setSelectedOrderForReturn(null)}
                className="px-4 py-2 text-xs text-[#7A7264]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmReturn(selectedOrderForReturn)}
                className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-5 py-2.5 rounded-xs"
              >
                Generate Pre-paid Return Label
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
