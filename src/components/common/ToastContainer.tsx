import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-0 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur-md border border-[#E5E0D8] rounded-md shadow-xl text-[#1F1F1F]"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#C85A32]" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#D32F2F]" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#E67E22]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#2C5E55]" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1F1F1F] leading-snug">{toast.message}</p>
              {toast.subMessage && (
                <p className="text-xs text-[#6B6B6B] mt-0.5 leading-relaxed truncate">{toast.subMessage}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9E9E9E] hover:text-[#1F1F1F] transition-colors p-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
