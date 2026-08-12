import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import DhLogo from './DhLogo';
import SectionIcon from './SectionIcon';
import type { Section } from '../../data/articles';
import { SECTIONS } from '../../data/articles';

interface GestureNavProps {
  activeSection: Section;
  onSectionChange: (s: Section) => void;
  rightActions?: ReactNode;
  children?: ReactNode;
}

export default function GestureNav({ activeSection, onSectionChange, rightActions, children }: GestureNavProps) {
  const [showNav, setShowNav] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const sectionIndex = SECTIONS.findIndex(s => s.key === activeSection);

  useEffect(() => setMounted(true), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && sectionIndex < SECTIONS.length - 1) {
        onSectionChange(SECTIONS[sectionIndex + 1].key);
      } else if (deltaX > 0 && sectionIndex > 0) {
        onSectionChange(SECTIONS[sectionIndex - 1].key);
      }
    }
  }, [sectionIndex, onSectionChange]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && sectionIndex < SECTIONS.length - 1) {
        onSectionChange(SECTIONS[sectionIndex + 1].key);
      } else if (e.key === 'ArrowLeft' && sectionIndex > 0) {
        onSectionChange(SECTIONS[sectionIndex - 1].key);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sectionIndex, onSectionChange]);

  return (
    <div className="min-h-screen" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DhLogo size="md" />
            <div className="hidden sm:block">
              <span className="font-headline text-lg font-semibold">Dhaka Heralds</span>
              <span className="text-text-muted text-xs ml-2 tracking-wider uppercase">Analysis</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 pulse-ring" />
              </div>
              <span className="text-xs font-medium text-red-500 uppercase tracking-wider">Live</span>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-2 hover:bg-surface-3 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            {rightActions}
            <button
              onClick={() => setShowNav(!showNav)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-2 hover:bg-surface-3 transition-colors md:hidden"
              aria-label="Menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showNav ? <path d="M18 6L6 18M6 6l12 12"/> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Section nav */}
      <nav className="sticky top-14 z-30 glass border-t border-border" aria-label="Sections">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-none">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => onSectionChange(s.key)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === s.key
                    ? 'bg-gold text-black'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                {s.label}
              </button>
            ))}
            <div className="flex items-center gap-1 ml-3 pl-3 border-l border-border">
              {SECTIONS.map((s) => (
                <div
                  key={s.key}
                  className={`gesture-dot w-1.5 h-1.5 rounded-full transition-all ${
                    activeSection === s.key ? 'gesture-dot-active' : 'bg-text-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 section-enter" key={activeSection}>
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border md:hidden" aria-label="Bottom navigation">
        <div className="flex justify-around py-2">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => onSectionChange(s.key)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors"
            >
              <SectionIcon section={s.key} active={activeSection === s.key} />
              <span className={`text-[10px] font-medium ${activeSection === s.key ? 'text-gold' : 'text-text-muted'}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  );
}
