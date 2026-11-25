import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, ArrowUpRight } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { motion, AnimatePresence } from 'motion/react';

export const WhatsAppButton: React.FC = () => {
  const { siteConfig } = useCms();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    const rawNumber = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
    const defaultMsg = encodeURIComponent(
      `Hello ${siteConfig.founder.split(' ')[0]}, I would like to discuss an interior design project with ${siteConfig.name}.`
    );
    if (rawNumber && rawNumber.length >= 7) {
      const a = document.createElement('a');
      a.href = `https://wa.me/${rawNumber}?text=${defaultMsg}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      setShowNotification(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <div
          className={`hidden sm:block px-3 py-1.5 bg-[#181615] text-[#FBF9F6] text-xs font-medium shadow-lg transition-all duration-200 pointer-events-none ${
            showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <span>Chat about your space</span>
        </div>

        <button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={`Contact ${siteConfig.name} on WhatsApp`}
          className="w-11 h-11 rounded-full bg-[#181615] hover:bg-[#8E4A36] text-[#FBF9F6] flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 border border-white/15 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
        </button>
      </div>

      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-6 z-50 max-w-sm p-5 bg-[#181615] text-[#FBF9F6] border border-[#8E4A36]/50 shadow-2xl space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#D5A38C]" />
                <span className="text-[11px] uppercase tracking-widest text-[#D5A38C] font-medium">
                  Direct Consultation
                </span>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-light">
              WhatsApp number is currently set as{' '}
              <span className="font-mono text-white">{siteConfig.whatsappNumber}</span>. Send your brief directly through our studio enquiry form.
            </p>

            <button
              onClick={() => {
                setShowNotification(false);
                navigate('/contact');
              }}
              className="w-full py-2.5 bg-[#8E4A36] text-white hover:bg-white hover:text-[#181615] text-[11px] uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to Enquiry Form</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
