import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Eye, EyeOff, X, KeyRound, ShieldAlert, ArrowRight } from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { 
    isAdminAuthModalOpen, 
    setIsAdminAuthModalOpen, 
    verifyAdminPassword 
  } = useStore();

  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdminAuthModalOpen) {
      setPasscode('');
      setError('');
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isAdminAuthModalOpen]);

  if (!isAdminAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the admin passcode.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const isValid = await verifyAdminPassword(passcode);
      setIsSubmitting(false);
      if (!isValid) {
        setError('Incorrect administrator passcode. Cryptographic verification failed.');
        inputRef.current?.select();
      }
    } catch {
      setIsSubmitting(false);
      setError('Security verification timed out. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white border border-[#EBE8E2] shadow-2xl rounded-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1F1F1F] text-[#F9F8F6] p-6 pb-5 flex items-center justify-between border-b border-[#333333]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xs bg-[#C85A32]/20 border border-[#C85A32]/40 flex items-center justify-center text-[#C85A32]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Merchant Operations
              </h3>
              <p className="text-xs text-[#A8A8A8]">
                Protected DivaChic administrative console
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminAuthModalOpen(false)}
            className="text-[#A8A8A8] hover:text-white p-1 rounded-xs transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <p className="text-xs text-[#6E685F] leading-relaxed mb-5">
            This area is restricted to authorized store operators and inventory managers. Please enter your administrator passcode to proceed.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="admin-passcode" 
                className="block text-xs font-semibold text-[#1F1F1F] uppercase tracking-wider mb-2 flex items-center justify-between"
              >
                <span>Security Passcode</span>
                <span className="text-[11px] font-normal lowercase text-[#9E978C]">Required</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E978C]">
                  <KeyRound className="w-4 h-4" />
                </div>

                <input
                  ref={inputRef}
                  id="admin-passcode"
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter 10-digit passcode"
                  className={`w-full pl-9 pr-10 py-2.5 bg-white border ${
                    error ? 'border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]' : 'border-[#D5D0C5] focus:border-[#1F1F1F]'
                  } text-sm text-[#1F1F1F] placeholder:text-[#9E978C] focus:outline-none rounded-xs font-mono tracking-widest`}
                  required
                  autoComplete="off"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9E978C] hover:text-[#1F1F1F] cursor-pointer"
                  aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#C85A32] bg-[#FDF2EE] border border-[#F6D0C1] p-2 rounded-xs animate-shake">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdminAuthModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#6E685F] hover:text-[#1F1F1F] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1F1F1F] hover:bg-[#C85A32] text-white font-medium text-xs tracking-wider py-2.5 px-5 rounded-xs transition-colors uppercase cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Unlock Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
