import { useState, useEffect } from 'react';
import { useTheme } from '../../lib/theme';

interface DhLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';
}

export default function DhLogo({ size = 'md', variant = 'icon' }: DhLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const fullSizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  if (variant === 'full') {
    return (
      <div className="flex items-center gap-2">
        {mounted && theme === 'light' ? (
          <img
            src={`${import.meta.env.BASE_URL}logo.webp`}
            alt="Dhaka Heralds"
            className={`${fullSizeClasses[size]} h-auto`}
            style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.1))' }}
          />
        ) : (
          <div className="relative">
            <img
              src={`${import.meta.env.BASE_URL}logo.webp`}
              alt="Dhaka Heralds"
              className={`${fullSizeClasses[size]} h-auto`}
              style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.1))' }}
            />
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)',
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Icon variant - use logo.webp cropped to circle
  if (mounted && theme === 'light') {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border border-black/5`}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.webp`}
          alt="DH"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 relative`}
      style={{
        boxShadow: '0 0 16px rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}logo.webp`}
        alt="DH"
        className="w-full h-full object-cover"
      />
      {/* Sheen overlay for dark theme */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
