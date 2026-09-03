import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DivaChikLogo } from '../common/DivaChikLogo';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, showToast } = useStore();
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    if (authMode === 'register') {
      const res = await signupWithEmail(email, password, name);
      setIsLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
        showToast('Welcome to DivaChic!', 'success', 'Account created successfully with Firebase.');
      } else {
        setAuthError(res.error || 'Failed to create account.');
      }
    } else {
      const res = await loginWithEmail(email, password);
      setIsLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
        showToast('Welcome back!', 'success', 'Signed in securely with Firebase.');
      } else {
        setAuthError(res.error || 'Invalid email or password.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (res.success) {
      setIsAuthModalOpen(false);
      showToast('Signed in with Google', 'success', 'Firebase session authenticated.');
    } else {
      setAuthError(res.error || 'Google authentication failed.');
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsAuthModalOpen(false)}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-[#EAE6DE] relative z-10"
          >
        {/* Header */}
        <div className="p-6 border-b border-[#F0ECE1] flex items-center justify-between bg-[#FAF9F6]">
          <div>
            <div className="mb-1">
              <DivaChikLogo variant="full" size="sm" theme="auto" />
            </div>
            <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-widest">
              DivaChic Privé Lounge
            </span>
            <h3 className="text-xl font-semibold text-[#1F1F1F] font-editorial mt-0.5">
              {authMode === 'login' ? 'Sign In to Your Account' : 'Create New Member Account'}
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
        <div className="grid grid-cols-2 border-b border-[#F0ECE1] text-xs font-semibold text-center">
          <button
            onClick={() => { setAuthMode('login'); setAuthError(''); }}
            className={`py-3.5 transition-colors cursor-pointer ${
              authMode === 'login' ? 'border-b-2 border-[#C85A32] text-[#C85A32] font-bold bg-[#FAF9F6]/50' : 'text-[#7A7264] hover:text-black'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthMode('register'); setAuthError(''); }}
            className={`py-3.5 transition-colors cursor-pointer ${
              authMode === 'register' ? 'border-b-2 border-[#C85A32] text-[#C85A32] font-bold bg-[#FAF9F6]/50' : 'text-[#7A7264] hover:text-black'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Social SSO Button */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 border border-[#D5D0C5] hover:bg-[#FAF9F6] py-3 rounded-xs text-xs font-semibold text-[#1F1F1F] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
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
                or with email & password
              </span>
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xs flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <div>
                <label className="text-[11px] font-semibold text-[#7A7264] block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8C8477] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Helena Vance"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF9F6] border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32] focus:bg-white"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-[#7A7264] block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C8477] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF9F6] border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32] focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#7A7264] block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C8477] absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF9F6] border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32] focus:bg-white"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1F1F1F] hover:bg-black text-white py-3 font-semibold text-xs rounded-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Authenticating with Firebase...</span>
              ) : authMode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="pt-2 text-center text-xs text-[#7A7264]">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className="text-[#C85A32] font-semibold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className="text-[#C85A32] font-semibold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
};
