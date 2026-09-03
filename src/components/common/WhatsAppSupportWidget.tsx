import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WhatsAppSupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  const whatsappNumber = '916282377918';
  const defaultMessage = 'Hi DivaChic, I have an inquiry regarding products/orders';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  // Automatically show a friendly indicator after 4 seconds on initial visit
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasPrompted(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Format current local time for message timestamp (e.g. 1:30 AM)
  const currentTimeString = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(new Date());

  return (
    <>
      {/* ========================================================= */}
      {/* 1. CHAT POP-UP CARD                                      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 sm:bottom-24 right-4 sm:right-6 z-50 w-[320px] sm:w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl border border-[#075E54]/20 bg-[#EFEAE2]"
            style={{
              backgroundImage: `radial-gradient(#075E54 0.5px, transparent 0.5px)`,
              backgroundSize: '12px 12px',
              backgroundColor: '#EFEAE2'
            }}
          >
          {/* Header: WhatsApp Green Gradient Banner */}
          <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {/* Avatar with Online Pulse */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-[#075E54] flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white/40 overflow-hidden">
                  <span className="font-serif font-bold text-[#075E54]">DC</span>
                </div>
                {/* Online indicator dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075E54] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                  <span>DivaChic Support</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-sans font-medium">Verified</span>
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                  <span>Typically replies within minutes</span>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Close chat window"
              aria-label="Close chat window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Chat Bubble Content */}
          <div className="p-4 space-y-3 min-h-[140px] flex flex-col justify-between">
            {/* Centered Date Badge */}
            <div className="text-center">
              <span className="text-[10px] bg-white/80 text-[#54656F] px-2.5 py-0.5 rounded-full shadow-2xs font-medium uppercase tracking-wider">
                Today
              </span>
            </div>

            {/* Support Message Bubble */}
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs text-[#111B21] max-w-[92%] relative border border-black/5 self-start">
              <span className="font-bold text-[#075E54] text-[11px] block mb-1">
                DivaChic Concierge
              </span>
              <p className="leading-relaxed text-[#1F2430]">
                Hello! Welcome to DivaChic. How can we help you today?
              </p>
              
              <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-[#667781]">
                <span>{currentTimeString}</span>
                {/* WhatsApp Double Blue Checkmarks */}
                <span className="text-[#53BDEB] font-bold text-xs leading-none">✓✓</span>
              </div>
            </div>
          </div>

          {/* Action Footer: Large WhatsApp Action Button */}
          <div className="bg-white p-3.5 border-t border-[#D1D7DB] space-y-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer group uppercase tracking-wider"
            >
              {/* WhatsApp Vector Icon */}
              <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.079-1.895-.443-1.614-.668-2.656-2.308-2.736-2.416-.08-.107-.648-.864-.648-1.654 0-.791.411-1.179.559-1.339.148-.16.324-.2.433-.2.109 0 .217.001.312.006.1.005.234-.038.365.279.136.329.467 1.139.508 1.222.041.084.068.182.013.29-.054.108-.082.176-.162.27-.08.094-.169.21-.242.282-.081.081-.166.17-.071.332.095.163.424.7.91 1.133.626.557 1.155.729 1.318.81.163.081.258.072.355-.039.096-.111.411-.478.52-.642.109-.163.218-.136.366-.081.148.055.938.442 1.099.523.162.081.27.121.309.189.04.068.04 3.93-.104.796zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.987-1.393A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.17 8.17 0 0 1-4.242-1.183l-.304-.183-2.96.827.799-2.922-.198-.319A8.17 8.17 0 0 1 3.8 12c0-4.522 3.678-8.2 8.2-8.2 4.522 0 8.2 3.678 8.2 8.2 0 4.522-3.678 8.2-8.2 8.2z"/>
              </svg>
              <span>Chat on WhatsApp</span>
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </a>
            
            <p className="text-[10px] text-center text-[#8696A0] font-sans">
              🔒 Direct Verified WhatsApp Support Line
            </p>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 2. FLOATING WHATSAPP BUTTON (bottom-6 right-6 z-50)       */}
      {/* ========================================================= */}
      <div className="fixed bottom-20 sm:bottom-6 right-5 sm:right-6 z-50 flex items-center group">
        
        {/* Subtle Tooltip Pill (Shows when closed) */}
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className={`mr-3 hidden md:flex items-center gap-2 bg-white text-[#1F1F1F] px-3.5 py-1.5 rounded-full shadow-lg border border-[#EAE6DE] text-xs font-semibold cursor-pointer transition-all duration-300 hover:scale-105 ${
              hasPrompted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
            <span>Need help? Chat with us</span>
          </div>
        )}

        {/* Circular Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close WhatsApp customer support' : 'Open WhatsApp customer support'}
          className={`relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${
            isOpen ? 'rotate-90 ring-4 ring-white/50' : 'ring-4 ring-[#25D366]/30'
          }`}
        >
          {/* Subtle Outer Ripple Ring when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none"></span>
          )}

          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            /* WhatsApp Official Vector Logo */
            <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.079-1.895-.443-1.614-.668-2.656-2.308-2.736-2.416-.08-.107-.648-.864-.648-1.654 0-.791.411-1.179.559-1.339.148-.16.324-.2.433-.2.109 0 .217.001.312.006.1.005.234-.038.365.279.136.329.467 1.139.508 1.222.041.084.068.182.013.29-.054.108-.082.176-.162.27-.08.094-.169.21-.242.282-.081.081-.166.17-.071.332.095.163.424.7.91 1.133.626.557 1.155.729 1.318.81.163.081.258.072.355-.039.096-.111.411-.478.52-.642.109-.163.218-.136.366-.081.148.055.938.442 1.099.523.162.081.27.121.309.189.04.068.04 3.93-.104.796zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.987-1.393A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.17 8.17 0 0 1-4.242-1.183l-.304-.183-2.96.827.799-2.922-.198-.319A8.17 8.17 0 0 1 3.8 12c0-4.522 3.678-8.2 8.2-8.2 4.522 0 8.2 3.678 8.2 8.2 0 4.522-3.678 8.2-8.2 8.2z"/>
            </svg>
          )}

          {/* Active Online Indicator Dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-xs">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default WhatsAppSupportWidget;
