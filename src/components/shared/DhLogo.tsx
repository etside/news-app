import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function DhLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  if (mounted && theme === 'light') {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <span className="font-headline font-bold text-gold">DH</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-white flex items-center justify-center`}
      style={{ boxShadow: '0 0 16px rgba(255,255,255,0.15)' }}
    >
      <span className="font-headline font-bold text-[#0A0A0C]">DH</span>
    </div>
  );
}
