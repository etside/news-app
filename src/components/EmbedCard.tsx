import { useState } from 'react';

interface EmbedCardProps {
  embedUrl: string;
  thumbnailUrl: string;
  mediaType: 'video' | 'image';
  owner: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    website: string;
  };
  engagement: { likes: number; comments: number };
  caption: string;
}

/**
 * Renders an Instagram embed with ownership attribution.
 * Shows a styled card linking to the original post with platform branding.
 */
export default function EmbedCard({ embedUrl, thumbnailUrl, mediaType, owner, engagement, caption }: EmbedCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="embed-card rounded-xl overflow-hidden border border-black/5 bg-white" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Platform header with ownership */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]">
            <div className="w-full h-full rounded-full overflow-hidden bg-white p-[1px]">
              <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#0A0A0C]">{owner.handle}</span>
              {owner.verified && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#3897F0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )}
            </div>
            <span className="text-[10px] text-[#8A8A84]">{owner.name}</span>
          </div>
        </div>
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#F0EFE8] text-[10px] font-semibold text-[#0A0A0C] hover:bg-[#E4E3DA] transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View
        </a>
      </div>

      {/* Thumbnail / embed preview */}
      <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
        <div className="aspect-[4/5] sm:aspect-[9/16] max-h-[400px] overflow-hidden bg-black/5">
          {!loaded && (
            <div className="absolute inset-0 skeleton-shimmer" />
          )}
          <img
            src={thumbnailUrl}
            alt=""
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
          {mediaType === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-black/70 transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </a>

      {/* Engagement + ownership footer */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-[#4A4A44] hover:text-[#FF3B3B] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <span className="text-xs font-medium">{engagement.likes}</span>
            </button>
            <span className="flex items-center gap-1 text-[#4A4A44]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <span className="text-xs font-medium">{engagement.comments}</span>
            </span>
          </div>
          <span className="text-[10px] text-[#8A8A84]">via Instagram</span>
        </div>
      </div>
    </div>
  );
}
