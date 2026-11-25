import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackLabel?: string;
  style?: React.CSSProperties;
}

const RESPONSIVE_WIDTHS = [480, 960, 1440, 2160] as const;

export function buildResponsiveWebpSrcSet(src?: string): string | null {
  if (!src) return null;

  // Match /assets/muskan/<name>.<ext> or /uploads/<name>.<ext>
  const match = src.match(/^(\/assets\/muskan|\/uploads)\/([^/?#]+)\.(jpe?g|png|webp|avif)$/i);
  if (!match) return null;

  const prefix = match[1];
  const stem = match[2];

  return RESPONSIVE_WIDTHS.map(
    (w) => `${prefix}/opt/${stem}-${w}w.webp ${w}w`
  ).join(', ');
}

export function getHighResImageSrc(src?: string): string {
  if (!src) return '';
  const match = src.match(/^(\/assets\/muskan|\/uploads)\/([^/?#]+)\.(jpe?g|png|webp|avif)$/i);
  if (!match) return src;
  return `${match[1]}/opt/${match[2]}-2160w.webp`;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  sizes = '(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  fallbackLabel,
  style,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EDE8DF] via-[#E5DFD3] to-[#D8D0C2] text-[#6B655E] p-6 text-center select-none ${className}`}
        style={style}
        role="img"
        aria-label={alt}
      >
        <div className="w-8 h-[1px] bg-[#8E4A36]/50 mb-3" />
        <span className="font-serif text-base sm:text-lg italic text-[#181615]/80">
          {fallbackLabel || alt || 'Spaces by Muskan'}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#6B655E]">
          Interior Architecture
        </span>
      </div>
    );
  }

  const webpSrcSet = buildResponsiveWebpSrcSet(src);

  return (
    <picture className="block w-full h-full">
      {webpSrcSet && (
        <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    </picture>
  );
};
