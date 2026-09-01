import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Lock, Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DivaChikLogo } from '../common/DivaChikLogo';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    sendEmailOtpCode, 
    verifyEmailOtpCode, 
    loginWithPassword, 
    registerWithPassword, 
    loginWithGoogle, 
    loginWithPhoneOtp,
    showToast 
  } = useStore();
  
  const [authMode, setAuthMode] = useState<'email-otp' | 'register' | 'login' | 'phone-otp'>('email-otp');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }
    setIsLoading(true);
    const res = await sendEmailOtpCode(email);
    setIsLoading(false);
    if (res.success) {
      setEmailOtpSent(true);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      showToast('Please enter the 6-digit verification code', 'warning');
      return;
    }
    setIsLoading(true);
    const res = await verifyEmailOtpCode(email, otpCode);
    setIsLoading(false);
    if (res.success) {
      setIsAuthModalOpen(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (authMode === 'register') {
      const res = await registerWithPassword(email, password, name);
      setIsLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
      }
    } else if (authMode === 'login') {
      const res = await loginWithPassword(email, password);
      setIsLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
      }
    }
  };

  const handlePhoneOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtpSent) {
      setPhoneOtpSent(true);
      showToast('OTP sent to ' + phone, 'info', 'Use demo code: 123456');
      return;
    }
    setIsLoading(true);
    const success = await loginWithPhoneOtp(phone, otpCode);
    setIsLoading(false);
    if (success) {
      setIsAuthModalOpen(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await loginWithGoogle();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white max-w-md w-full rounded-xs shadow-2xl overflow-hidden border border-[#EAE6DE]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#F0ECE1] flex items-center justify-between bg-[#FAF9F6]">
          <div>
            <div className="mb-1">
              <DivaChikLogo variant="full" size="sm" theme="dark" />
            </div>
            <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-widest">
              Diva'Chik Privé Lounge
            </span>
            <h3 className="text-xl font-semibold text-[#1F1F1F] font-editorial mt-0.5">
              {authMode === 'email-otp' 
                ? 'Sign In / Register with Email OTP' 
                : authMode === 'register' 
                ? 'Create New Member Account' 
                : authMode === 'login'
                ? 'Password Sign In'
                : 'Mobile Phone OTP Login'}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-[#8C8477] hover:text-[#1F1F1F] cursor-pointer self-start"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 border-b border-[#F0ECE1] text-[11px] font-semibold text-center">
          <button
            onClick={() => { setAuthMode('email-otp'); setEmailOtpSent(false); setOtpCode(''); }}
            className={`py-3 transition-colors cursor-pointer ${
              authMode === 'email-otp' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#7A7264] hover:text-black'
            }`}
          >
            Email OTP
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`py-3 transition-colors cursor-pointer ${
              authMode === 'register' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#7A7264] hover:text-black'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setAuthMode('login')}
            className={`py-3 transition-colors cursor-pointer ${
              authMode === 'login' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#7A7264] hover:text-black'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => { setAuthMode('phone-otp'); setPhoneOtpSent(false); setOtpCode(''); }}
            className={`py-3 transition-colors cursor-pointer ${
              authMode === 'phone-otp' ? 'border-b-2 border-[#C85A32] text-[#C85A32]' : 'text-[#7A7264] hover:text-black'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Social SSO Button */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-[#D5D0C5] hover:bg-[#FAF9F6] py-2.5 rounded-xs text-xs font-semibold text-[#1F1F1F] transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#EAE6DE] w-full"></div>
              <span className="bg-white px-3 text-[10px] text-[#8C8477] uppercase tracking-wider absolute">
                or use {authMode.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Email OTP Mode */}
          {authMode === 'email-otp' && (
            <div>
              {!emailOtpSent ? (
                <form onSubmit={handleSendEmailOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4A453C] mb-1">Customer Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8C8477] absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                    <span className="text-[10px] text-[#7A7264] mt-1 block">
                      A 6-digit security OTP code will be sent to your email address via Supabase Auth.
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold tracking-wider uppercase py-3 rounded-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Sending Code...' : 'Send Email OTP Code'}
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
                  <div className="p-3 bg-[#FAF9F6] border border-[#EAE6DE] rounded-xs text-xs text-[#4A453C] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8C8477] block">OTP Sent To</span>
                      <span className="font-semibold text-[#1F1F1F]">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailOtpSent(false)}
                      className="text-[10px] text-[#C85A32] underline hover:text-[#B34E2A]"
                    >
                      Change Email
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A453C] mb-1">Enter 6-Digit Email Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs text-center font-mono tracking-widest text-base focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold tracking-wider uppercase py-3 rounded-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Verifying...' : 'Verify OTP & Create/Sign In Account'}
                      {!isLoading && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      className="w-full text-[11px] text-[#7A7264] hover:text-[#1F1F1F] text-center block pt-1"
                    >
                      Resend Code to {email}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Password Register / Login */}
          {(authMode === 'register' || authMode === 'login') && (
            <form onSubmit={handlePasswordAuth} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-[#4A453C] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C8477] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C8477] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold tracking-wider uppercase py-3 rounded-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isLoading 
                    ? 'Processing...' 
                    : authMode === 'register' 
                    ? 'Create Member Account' 
                    : 'Sign In to Account'}
                </button>
              </div>
            </form>
          )}

          {/* Mobile Phone OTP */}
          {authMode === 'phone-otp' && (
            <form onSubmit={handlePhoneOtpSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#4A453C] mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C8477] absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {phoneOtpSent && (
                <div>
                  <label className="block text-xs font-medium text-[#4A453C] mb-1">Enter 6-Digit SMS Code</label>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs text-center font-mono tracking-widest text-base focus:outline-none focus:border-[#C85A32]"
                  />
                  <span className="text-[10px] text-[#1E5638] mt-1 block text-center font-medium">
                    Demo Code: <strong>123456</strong>
                  </span>
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold tracking-wider uppercase py-3 rounded-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {!phoneOtpSent ? 'Send SMS Code' : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
};

