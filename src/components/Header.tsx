import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { useEnquiry } from '../context/EnquiryContext';
import { OptimizedImage } from './OptimizedImage';

export const Header: React.FC = () => {
  const { siteConfig } = useCms();
  const { openEnquiry } = useEnquiry();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLabels = siteConfig.navLabels || {
    work: 'Work',
    services: 'Services',
    about: 'About',
    process: 'Process',
    contact: 'Contact',
  };
  const ctaLabel = siteConfig.headerCtaLabel || 'Start a Project';

  const hasTopTicker = Boolean(
    siteConfig.announcementTicker?.enabled &&
      siteConfig.announcementTicker.items?.length > 0 &&
      (siteConfig.announcementTicker.placement === 'top_bar' ||
        siteConfig.announcementTicker.placement === 'both')
  );

  const navLinks = [
    { to: '/projects', label: navLabels.work, number: '01' },
    { to: '/services', label: navLabels.services, number: '02' },
    { to: '/about', label: navLabels.about, number: '03' },
    { to: '/process', label: navLabels.process, number: '04' },
    { to: '/contact', label: navLabels.contact, number: '05' },
  ];

  const mobileLinks = [
    { to: '/', label: 'Home', number: '01' },
    { to: '/projects', label: navLabels.work, number: '02' },
    { to: '/services', label: navLabels.services, number: '03' },
    { to: '/about', label: navLabels.about, number: '04' },
    { to: '/process', label: navLabels.process, number: '05' },
    { to: '/contact', label: navLabels.contact, number: '06' },
  ];

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
          hasTopTicker ? 'top-8' : 'top-0'
        } ${
          isScrolled
            ? 'py-3.5 bg-[#F6F3EE]/94 backdrop-blur-md border-b border-[#DFD8CE]'
            : 'py-5 sm:py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between gap-8">
            {/* Zone 1: Clean Brand Wordmark (1-line, zero adjacent descriptor tags) */}
            <Link
              to="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-80 whitespace-nowrap shrink-0"
              aria-label={`${siteConfig.name} - Homepage`}
            >
              {siteConfig.logoEmblem && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#DFD8CE] shrink-0">
                  <OptimizedImage
                    src={siteConfig.logoEmblem}
                    alt={`${siteConfig.name} emblem`}
                    sizes="32px"
                    priority
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="font-serif text-xl sm:text-2xl tracking-tight text-[#181615] font-normal whitespace-nowrap">
                {siteConfig.name}
              </span>
            </Link>

            {/* Zone 2: Clean Single-Line Architectural Navigation */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[11px] uppercase tracking-[0.2em] font-sans font-medium">
              {navLinks.map((item) => {
                const isActive = location.pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`transition-colors relative py-1 nav-link-animated whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-[#181615] font-semibold active'
                        : 'text-[#6B655E] hover:text-[#181615]'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Zone 3: Single Primary Action & Mobile Menu Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openEnquiry('Residential Interiors')}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] bg-[#181615] text-[#FBF9F6] hover:bg-[#8E4A36] transition-colors duration-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="md:hidden p-2 -mr-2 text-[#181615] transition-colors cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Compact Refined Right-Side Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: '0%', opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[82vw] max-w-[350px] max-h-[82vh] m-3 bg-[#181615] text-[#FBF9F6] border border-white/10 shadow-2xl z-10 flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <span className="font-serif text-base tracking-wide text-[#FBF9F6]">
                  {siteConfig.name}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex flex-col py-4 space-y-1">
                {mobileLinks.map((item, idx) => {
                  const isActive =
                    item.to === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.to);

                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * (idx + 1), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between py-2.5 px-1 transition-colors group ${
                          isActive ? 'text-white' : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        <span className={`font-serif text-xl tracking-wide ${isActive ? 'font-medium italic text-[#D5A38C]' : 'font-light'}`}>
                          {item.label}
                        </span>
                        <span className="font-mono text-[10px] text-stone-500 group-hover:text-[#A38452] tabular-nums">
                          {item.number}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openEnquiry('Residential Interiors');
                  }}
                  className="w-full py-3 bg-[#8E4A36] hover:bg-white hover:text-[#181615] text-white text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between text-[10px] text-stone-400 tracking-wider uppercase px-0.5">
                  <span>{siteConfig.founder}</span>
                  <span className="text-[#A38452]">2D · 3D · Vastu</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
