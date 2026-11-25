import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, Instagram, Youtube } from 'lucide-react';
import { motion } from 'motion/react';
import { useCms } from '../context/CmsContext';
import { OptimizedImage } from './OptimizedImage';

export const Footer: React.FC = () => {
  const { siteConfig } = useCms();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#181615] text-[#FBF9F6] pt-20 pb-12 border-t border-[#2A2623] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Studio Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="pb-14 border-b border-white/10"
        >
          <span className="text-[11px] uppercase tracking-[0.26em] text-[#D5A38C] block mb-3.5 font-sans font-medium">
            {siteConfig.name} · {siteConfig.secondaryMark}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-tight max-w-4xl">
            {siteConfig.footerStatementLine1} <br />
            <span className="italic font-normal text-[#DFD8CE]">{siteConfig.footerStatementLine2}</span>
          </h2>
        </motion.div>

        {/* Main Footer Directory Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 py-14 border-b border-white/10">
          {/* Brand & Ethos Column */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3.5 group">
              {siteConfig.logoEmblem && (
                <div className="w-11 h-11 rounded-full overflow-hidden border border-white/15 shrink-0">
                  <OptimizedImage
                    src={siteConfig.logoEmblem}
                    alt={`${siteConfig.name} emblem`}
                    sizes="44px"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-light text-white block tracking-wide">
                  {siteConfig.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#A38452]">
                  {siteConfig.secondaryMark}
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed font-light">
              {siteConfig.footerDescription}
            </p>
            <div className="pt-1 text-xs text-[#D5A38C] tracking-wider uppercase">
              Founded by {siteConfig.founder} · Interior Designer &amp; Vastu Consultant
            </div>
          </div>

          {/* Numbered Navigation Directory */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#D5A38C] block font-medium font-sans">
              Directory
            </span>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
              {[
                { to: '/', label: 'Home', num: '01' },
                { to: '/projects', label: 'Work', num: '02' },
                { to: '/services', label: 'Services', num: '03' },
                { to: '/about', label: 'About', num: '04' },
                { to: '/process', label: 'Process', num: '05' },
                { to: '/contact', label: 'Contact', num: '06' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors flex items-center justify-between group">
                    <span>{link.label}</span>
                    <span className="font-mono text-[10px] text-stone-500 group-hover:text-[#D5A38C] tabular-nums">{link.num}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Direct Correspondence */}
          <div className="md:col-span-4 space-y-4">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#D5A38C] block font-medium font-sans">
              Correspondence &amp; Channels
            </span>
            <div className="space-y-3 text-xs text-stone-300">
              <div>
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-2 group text-[#EDE8DF]"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#D5A38C]" />
                  <span>Instagram: {siteConfig.instagramHandle}</span>
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
              <div>
                <a
                  href={siteConfig.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-2 group text-[#EDE8DF]"
                >
                  <Youtube className="w-3.5 h-3.5 text-[#D5A38C]" />
                  <span>YouTube: {siteConfig.youtubeHandle}</span>
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
              <div className="text-stone-400 pt-1">
                <span className="text-[10px] uppercase text-stone-500 block mb-0.5">Telephone</span>
                <span>{siteConfig.phone}</span>
              </div>
              <div className="text-stone-400">
                <span className="text-[10px] uppercase text-stone-500 block mb-0.5">Direct Email</span>
                <span>{siteConfig.email}</span>
              </div>
              <div className="text-stone-400">
                <span className="text-[10px] uppercase text-stone-500 block mb-0.5">Studio Location</span>
                <span>{siteConfig.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <div className="flex flex-wrap items-center gap-2 text-stone-400">
            <span>&copy; 2026 {siteConfig.name}.</span>
            <span aria-hidden="true">·</span>
            <span>{siteConfig.founder}</span>
            <span aria-hidden="true">·</span>
            <Link to="/wp-admin" className="text-stone-500 hover:text-white transition-colors">
              Studio Admin
            </Link>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
            aria-label="Back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
