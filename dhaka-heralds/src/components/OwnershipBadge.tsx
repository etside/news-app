interface OwnershipBadgeProps {
  owner: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    website: string;
  };
  timestamp: string;
  compact?: boolean;
}

/**
 * Displays source ownership and attribution for news content.
 * Shows the original creator with verified badge and time context.
 */
export default function OwnershipBadge({ owner, timestamp, compact = false }: OwnershipBadgeProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <img src={owner.avatar} alt="" className="w-5 h-5 rounded-full object-cover" loading="lazy" />
        <span className="text-[10px] font-medium text-[#4A4A44]">{owner.handle}</span>
        {owner.verified && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#3897F0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pt-3 border-t border-black/5">
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
          <span className="text-[10px] text-[#8A8A84]">{timestamp}</span>
        </div>
      </div>
      <a
        href={owner.website}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 rounded-full bg-[#F0EFE8] text-[10px] font-semibold text-[#0A0A0C] hover:bg-[#E4E3DA] transition-colors"
      >
        {owner.name}
      </a>
    </div>
  );
}
