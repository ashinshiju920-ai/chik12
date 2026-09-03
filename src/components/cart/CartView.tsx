import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  Tag, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  FileText,
  Sparkles
} from 'lucide-react';

export const CartView: React.FC = () => {
  const { 
    cart, 
    cartCount, 
    cartSubtotal, 
    cartTotal, 
    cartDiscount, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    orderNote, 
    setOrderNote,
    formatPrice, 
    freeShippingThreshold, 
    freeShippingRemaining, 
    isFreeShipping,
    standardDeliveryDays,
    onlineDiscountPercent,
    calculateDeliveryDate,
    setActivePage,
    openProductDetail,
    showToast
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const success = applyCoupon(couponInput);
    if (success) {
      setCouponInput('');
    }
  };

  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#F5F3EF] flex items-center justify-center text-[#8C8477]">
          <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
        </div>
        <h2 className="text-3xl font-semibold text-[#1F1F1F] font-editorial">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-sm text-[#7A7264] max-w-md mx-auto">
          Explore our handcrafted Nordic optics, bags, accessories, and apparel collections.
        </p>
        <div>
          <button
            onClick={() => setActivePage('shop')}
            className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold tracking-wider uppercase px-8 py-3.5 rounded-xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discover Collections</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F8F6] min-h-screen pt-6 pb-32 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="border-b border-[#EAE6DE] pb-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F1F1F] font-editorial">
              Your Shopping Bag
            </h1>
            <p className="text-xs text-[#827A6D] mt-1">
              Review your selected Nordic designer essentials before checkout.
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-[#8C8477] hover:text-[#D32F2F] transition-colors underline cursor-pointer"
          >
            Clear Entire Bag
          </button>
        </div>

        {/* Free Shipping Alert Box */}
        <div className="bg-white border border-[#EAE6DE] p-4 rounded-xs mb-8">
          <div className="flex items-center justify-between text-xs mb-2">
            {isFreeShipping ? (
              <span className="font-semibold text-[#1E5638] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E5638]" />
                <span>You’ve unlocked Free Standard Delivery! ($75+ Order)</span>
              </span>
            ) : (
              <span className="text-[#555048] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C85A32]" />
                <span>Add <strong>{formatPrice(freeShippingRemaining)}</strong> more to unlock <strong>FREE DELIVERY</strong></span>
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-[#EFECE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C85A32] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Main Cart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Cart Items Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#EAE6DE] rounded-xs overflow-hidden shadow-xs">
              
              <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-[#FAF9F6] border-b border-[#EAE6DE] text-xs font-semibold text-[#1F1F1F] uppercase tracking-wider">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-[#F0ECE1] p-4 sm:p-0">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 sm:p-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center flex flex-col gap-3"
                  >
                    {/* Product Media & Title */}
                    <div className="sm:col-span-6 flex gap-4 items-center">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        onClick={() => openProductDetail(item.product)}
                        className="w-20 h-20 object-cover rounded-xs border border-[#EAE6DE] bg-[#F5F3EF] cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <h3
                          onClick={() => openProductDetail(item.product)}
                          className="text-sm font-semibold text-[#1F1F1F] hover:text-[#C85A32] transition-colors cursor-pointer truncate"
                        >
                          {item.product.name}
                        </h3>
                        <div className="text-xs text-[#7A7264] mt-0.5 space-x-2">
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-[#A0988A] hover:text-[#D32F2F] transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2 sm:text-center text-xs font-medium text-[#1F1F1F]">
                      <span className="sm:hidden text-[#8C8477] mr-2">Unit Price:</span>
                      {formatPrice(item.price)}
                    </div>

                    {/* Quantity Picker */}
                    <div className="sm:col-span-2 flex sm:justify-center items-center">
                      <div className="flex items-center border border-[#D5D0C5] rounded-xs bg-white h-8 px-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="text-xs text-[#6E685F] hover:text-[#1F1F1F] px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#1F1F1F]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="text-xs text-[#6E685F] hover:text-[#1F1F1F] px-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="sm:col-span-2 sm:text-right text-sm font-bold text-[#1F1F1F]">
                      <span className="sm:hidden text-xs font-normal text-[#8C8477] mr-2">Subtotal:</span>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions / Order Note */}
            <div className="bg-white border border-[#EAE6DE] p-5 rounded-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1F1F]">
                <FileText className="w-4 h-4 text-[#C85A32]" />
                <span>Special Instructions / Gift Message for the Order</span>
              </div>
              <textarea
                rows={2}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Add special packaging notes, gate access instructions, or personalized gift card messages..."
                className="w-full text-xs p-3 border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32] bg-[#FAF9F6]"
              />
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Promo Code Box */}
            <div className="bg-white border border-[#EAE6DE] p-5 rounded-xs shadow-xs space-y-3">
              <h4 className="text-xs font-semibold text-[#1F1F1F] uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#C85A32]" />
                <span>Promo Code / Gift Voucher</span>
              </h4>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-[#FAF1ED] border border-[#C85A32]/30 rounded-xs text-xs">
                  <div>
                    <span className="font-bold text-[#C85A32]">{appliedCoupon.code}</span>
                    <p className="text-[11px] text-[#6E685F]">{appliedCoupon.description}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-[#D32F2F] hover:underline font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. DIVA10 or DIVACHIC20"
                    className="flex-1 px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32] uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold px-4 py-2 rounded-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              <div className="text-[11px] text-[#8C8477]">
                Try code <strong>DIVA10</strong> for 10% off or <strong>FREESHIP</strong>.
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="bg-white border border-[#EAE6DE] p-6 rounded-xs shadow-xs space-y-4">
              <h3 className="text-base font-semibold text-[#1F1F1F] font-sans pb-3 border-b border-[#F0ECE1]">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-[#555048]">
                <div className="flex justify-between">
                  <span>Bag Subtotal:</span>
                  <span className="font-semibold text-[#1F1F1F]">{formatPrice(cartSubtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[#1E5638] font-medium">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-{formatPrice(cartDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping:</span>
                  <span className="font-semibold text-[#1F1F1F]">
                    {isFreeShipping ? 'FREE' : formatPrice(5.00)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#C85A32] bg-[#FAF1ED] p-2 rounded-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    Est. Arrival ({standardDeliveryDays} days):
                  </span>
                  <span className="font-semibold">{calculateDeliveryDate().formattedDate}</span>
                </div>

                <div className="flex justify-between items-center text-[#1E5638] bg-[#EBF5EF] p-2.5 rounded-xs border border-[#1E5638]/20">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-[#1E5638]" />
                    <span>Pay Online at Checkout:</span>
                  </span>
                  <span className="font-bold">{onlineDiscountPercent}% Instant OFF</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%):</span>
                  <span>{formatPrice(cartSubtotal * 0.08)}</span>
                </div>

                <div className="pt-3 border-t border-[#F0ECE1] flex justify-between text-base font-bold text-[#1F1F1F]">
                  <span>Total:</span>
                  <span className="text-[#C85A32]">
                    {formatPrice(cartTotal + (isFreeShipping ? 0 : 5.00) + cartSubtotal * 0.08)}
                  </span>
                </div>
              </div>

              {/* Checkout Actions */}
              <div className="pt-4 space-y-3">
                <button
                  id="cart-checkout-cta"
                  onClick={() => {
                    setActivePage('checkout');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold tracking-wider uppercase py-4 rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setActivePage('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-center text-xs text-[#6E685F] hover:text-[#1F1F1F] py-2 transition-colors cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>

              {/* Trust Badge */}
              <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-center gap-2 text-[11px] text-[#8C8477]">
                <ShieldCheck className="w-4 h-4 text-[#1E5638]" />
                <span>Encrypted 256-bit SSL Checkout</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
