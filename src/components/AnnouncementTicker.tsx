import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { useEnquiry } from '../context/EnquiryContext';

interface AnnouncementTickerProps {
  position: 'top_bar' | 'below_hero';
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ position }) => {
  const { siteConfig } = useCms();
  const { openEnquiry } = useEnquiry();
  const navigate = useNavigate();

  const ticker = siteConfig.announcementTicker;
  if (!ticker || !ticker.enabled || !ticker.items || ticker.items.length === 0) {
    return null;
  }

  const shouldShow =
    ticker.placement === 'both' || ticker.placement === position;
  if (!shouldShow) return null;

  const durationSeconds =
    ticker.speed === 'fast' ? 18 : ticker.speed === 'slow' ? 42 : 28;

  const themeClasses =
    ticker.theme === 'terracotta_ivory'
      ? 'bg-[#8E4A36] text-[#FBF9F6] border-[#733928]'
      : ticker.theme === 'stone_minimal'
      ? 'bg-[#EDE8DF] text-[#181615] border-[#DFD8CE]'
      : 'bg-[#181615] text-[#F6F3EE] border-[#2B2724]';

  const separatorColor =
    ticker.theme === 'stone_minimal' ? 'text-[#8E4A36]' : 'text-[#D5A38C]';

  const handleClick = () => {
    if (ticker.clickableAction === 'enquiry') {
      openEnquiry('Residential Interiors');
    } else if (ticker.clickableAction === 'link' && ticker.actionLink) {
      if (ticker.actionLink.startsWith('http')) {
        window.open(ticker.actionLink, '_blank', 'noopener,noreferrer');
      } else {
        navigate(ticker.actionLink);
      }
    }
  };

  const trackContent = (
    <div className="flex items-center shrink-0">
      {ticker.items.map((text, idx) => (
        <span key={`${idx}-${text}`} className="inline-flex items-center gap-6 px-6">
          <Sparkles className={`w-3 h-3 shrink-0 ${separatorColor}`} />
          <span className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium whitespace-nowrap">
            {text}
          </span>
        </span>
      ))}
    </div>
  );

  const isTopBar = position === 'top_bar';

  return (
    <div
      onClick={ticker.clickableAction !== 'none' ? handleClick : undefined}
      role={ticker.clickableAction !== 'none' ? 'button' : undefined}
      tabIndex={ticker.clickableAction !== 'none' ? 0 : undefined}
      onKeyDown={(e) => {
        if (ticker.clickableAction !== 'none' && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`w-full overflow-hidden border-b select-none ${themeClasses} ${
        isTopBar ? 'fixed top-0 left-0 right-0 z-50 h-8 flex items-center' : 'py-2.5 flex items-center'
      } ${ticker.clickableAction !== 'none' ? 'cursor-pointer' : ''} ${
        ticker.pauseOnHover ? 'group' : ''
      }`}
      aria-label="Studio announcement ribbon"
    >
      <div
        className={`flex w-max items-center animate-sbm-marquee ${
          ticker.pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
        }`}
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {trackContent}
        {trackContent}
        {trackContent}
        {trackContent}
      </div>
    </div>
  );
};
