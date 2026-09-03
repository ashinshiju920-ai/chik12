import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  Tag,
  Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MiniCartDrawer: React.FC = () => {
  const { 
    isMiniCartOpen, 
    setIsMiniCartOpen, 
    cart, 
    cartCount, 
    cartSubtotal, 
    cartTotal, 
    cartDiscount, 
    updateCartQuantity, 
    removeFromCart, 
    formatPrice, 
    freeShippingThreshold, 
    freeShippingRemaining, 
    isFreeShipping, 
    onlineDiscountPercent,
    setActivePage,
    appliedCoupon
  } = useStore();

  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleCheckout = () => {
    setIsMiniCartOpen(false);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCart = () => {
    setIsMiniCartOpen(false);
    setActivePage('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isMiniCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with Soft Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsMiniCartOpen(false)}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10"
            >
          {/* Header */}
          <div className="p-5 border-b border-[#EFECE6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C85A32]" />
              <h3 className="text-base font-semibold text-[#1F1F1F] font-sans">
                Shopping Bag ({cartCount})
              </h3>
            </div>
            <button
              onClick={() => setIsMiniCartOpen(false)}
              className="p-1 text-[#8C8477] hover:text-[#1F1F1F] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="p-4 bg-[#FAF9F6] border-b border-[#EFECE6]">
            <div className="flex items-center justify-between text-xs mb-2">
              {isFreeShipping ? (
                <span className="font-semibold text-[#1E5638] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1E5638]" />
                  <span>Congratulations! You earned Free Shipping.</span>
                </span>
              ) : (
                <span className="text-[#555048] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#C85A32]" />
                  <span>Add <strong>{formatPrice(freeShippingRemaining)}</strong> more for <strong>FREE SHIPPING</strong></span>
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-[#E5E0D8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C85A32] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#F0ECE1]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#F5F3EF] flex items-center justify-center text-[#8C8477]">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <p className="text-sm font-medium text-[#1F1F1F]">Your bag is currently empty.</p>
                <p className="text-xs text-[#8C8477] max-w-xs">
                  Explore our handcrafted Nordic optics, bags, and apparel collections.
                </p>
                <button
                  onClick={() => {
                    setIsMiniCartOpen(false);
                    setActivePage('shop');
                  }}
                  className="mt-2 bg-[#1F1F1F] hover:bg-[#C85A32] text-white text-xs font-semibold px-6 py-2.5 rounded-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover bg-[#F5F3EF] rounded-xs border border-[#EBE8E2] shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-[#1F1F1F] truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#A0988A] hover:text-[#D32F2F] transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Variants */}
                    <div className="text-[11px] text-[#7A7264] mt-0.5 space-x-2">
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#D5D0C5] rounded-xs bg-white h-7 px-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="text-xs text-[#6E685F] hover:text-[#1F1F1F] px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-[#1F1F1F]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="text-xs text-[#6E685F] hover:text-[#1F1F1F] px-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-[#1F1F1F]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#FAF9F6] border-t border-[#EFECE6] space-y-3">
              {appliedCoupon && (
                <div className="flex justify-between text-xs text-[#1E5638] font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon.code})</span>
                  </span>
                  <span>-{formatPrice(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-[#1E5638] font-semibold bg-[#EBF5EF] p-2 rounded-xs border border-[#1E5638]/20">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#1E5638]" />
                  <span>Online Payments:</span>
                </span>
                <span>{onlineDiscountPercent}% Instant OFF</span>
              </div>

              <div className="flex justify-between text-sm font-semibold text-[#1F1F1F]">
                <span>Estimated Subtotal:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-[11px] text-[#8C8477]">
                Taxes and shipping calculated at checkout.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  id="mini-cart-checkout-button"
                  onClick={handleCheckout}
                  className="w-full bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleViewCart}
                  className="w-full bg-white hover:bg-[#F0ECE1] text-[#1F1F1F] border border-[#D5D0C5] text-xs font-semibold tracking-wider uppercase py-2.5 rounded-xs transition-colors cursor-pointer"
                >
                  View Full Bag
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
      )}
    </AnimatePresence>
  );
};
