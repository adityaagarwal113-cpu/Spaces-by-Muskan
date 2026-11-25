import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { useEnquiry } from '../context/EnquiryContext';
import { OptimizedImage } from './OptimizedImage';

const SESSION_KEY = 'sbm_promo_dismissed_session';
const DAY_KEY = 'sbm_promo_dismissed_day';

interface PromoPopupBannerProps {
  forceOpen?: boolean;
  onForceClose?: () => void;
}

export const PromoPopupBanner: React.FC<PromoPopupBannerProps> = ({
  forceOpen = false,
  onForceClose,
}) => {
  const { siteConfig } = useCms();
  const { openEnquiry } = useEnquiry();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const promo = siteConfig.promoPopup;

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    if (!promo || !promo.enabled) {
      setIsOpen(false);
      return;
    }

    if (promo.frequency === 'once_per_session' && sessionStorage.getItem(SESSION_KEY) === '1') {
      return;
    }

    if (promo.frequency === 'once_per_day') {
      const last = localStorage.getItem(DAY_KEY);
      if (last && Date.now() - Number(last) < 1000 * 60 * 60 * 24) {
        return;
      }
    }

    const delayMs = Math.max(0, Number(promo.delaySeconds ?? 4)) * 1000;
    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [forceOpen, promo]);

  if (!promo) return null;

  const dismiss = () => {
    setIsOpen(false);
    if (!forceOpen) {
      if (promo.frequency === 'once_per_session') {
        sessionStorage.setItem(SESSION_KEY, '1');
      } else if (promo.frequency === 'once_per_day') {
        localStorage.setItem(DAY_KEY, String(Date.now()));
      }
    }
    onForceClose?.();
  };

  const handleAction = () => {
    dismiss();
    if (promo.ctaAction === 'enquiry') {
      openEnquiry(promo.ctaServiceName || 'Residential Interiors');
    } else if (promo.ctaLink) {
      if (promo.ctaLink.startsWith('http')) {
        window.open(promo.ctaLink, '_blank', 'noopener,noreferrer');
      } else {
        navigate(promo.ctaLink);
      }
    }
  };

  const isDark = promo.style === 'charcoal_brass';
  const hasImage = Boolean(promo.image);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={promo.headline}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={dismiss}
            className="fixed inset-0 bg-[#181615]/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full ${
              hasImage ? 'max-w-3xl' : 'max-w-lg'
            } overflow-hidden shadow-2xl border ${
              isDark
                ? 'bg-[#181615] text-[#F6F3EE] border-white/15'
                : 'bg-[#FBF9F6] text-[#181615] border-[#DFD8CE]'
            }`}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close studio announcement"
              className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/20 text-white/80 hover:bg-white hover:text-[#181615]'
                  : 'border-[#DFD8CE] bg-[#FBF9F6]/90 text-[#181615] hover:bg-[#181615] hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`grid grid-cols-1 ${hasImage ? 'md:grid-cols-12' : ''}`}>
              {hasImage && (
                <div className="md:col-span-5 aspect-[4/3] md:aspect-auto md:min-h-[340px] bg-[#181615] relative overflow-hidden">
                  <OptimizedImage
                    src={promo.image}
                    alt={promo.headline}
                    sizes="(max-width: 768px) 92vw, 340px"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/55 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              <div
                className={`${
                  hasImage ? 'md:col-span-7' : ''
                } p-7 sm:p-10 flex flex-col justify-between space-y-6`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-[1px] ${
                        isDark ? 'bg-[#D5A38C]' : 'bg-[#8E4A36]'
                      }`}
                    />
                    <span
                      className={`text-[10px] uppercase tracking-[0.26em] font-medium ${
                        isDark ? 'text-[#D5A38C]' : 'text-[#8E4A36]'
                      }`}
                    >
                      {promo.eyebrow}
                    </span>
                  </div>

                  {promo.offerBadge && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border ${
                        promo.style === 'terracotta_split'
                          ? 'bg-[#8E4A36] text-white border-[#8E4A36]'
                          : isDark
                          ? 'bg-white/5 text-[#DFC59A] border-[#DFC59A]/40'
                          : 'bg-[#EDE8DF] text-[#8E4A36] border-[#DFD8CE]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>{promo.offerBadge}</span>
                    </div>
                  )}

                  <h3
                    className={`font-serif text-3xl sm:text-4xl font-light leading-[1.1] ${
                      isDark ? 'text-white' : 'text-[#181615]'
                    }`}
                  >
                    {promo.headline}
                  </h3>

                  <p
                    className={`text-xs sm:text-sm font-light leading-relaxed ${
                      isDark ? 'text-[#CFC8BE]' : 'text-[#4A4540]'
                    }`}
                  >
                    {promo.body}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAction}
                    className={`inline-flex items-center gap-2 px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-[#D5A38C] text-[#181615] hover:bg-white'
                        : 'bg-[#8E4A36] text-white hover:bg-[#181615]'
                    }`}
                  >
                    <span>{promo.ctaText || 'Claim Offer'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={dismiss}
                    className={`px-4 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                      isDark
                        ? 'text-[#9C948A] hover:text-white'
                        : 'text-[#6B655E] hover:text-[#181615]'
                    }`}
                  >
                    No Thanks
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
