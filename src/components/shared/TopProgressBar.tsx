import { useState, useEffect } from 'react';

export default function TopProgressBar() {
  const [loaded, setLoaded] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  // Phase 1: load animation 0→100%
  useEffect(() => {
    const steps = [
      { p: 30, d: 80 },
      { p: 60, d: 200 },
      { p: 85, d: 400 },
      { p: 95, d: 600 },
      { p: 100, d: 800 },
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach(({ p, d }) => {
      timers.push(setTimeout(() => setScrollPct(p), d));
    });
    timers.push(setTimeout(() => setLoaded(true), 1000));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Phase 2: scroll-driven (full bar at top → 0 at bottom)
  useEffect(() => {
    if (!loaded) return;

    const calc = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollPct(100);
        return;
      }
      const pct = Math.max(0, Math.min(100, 100 - (scrollTop / docHeight) * 100));
      setScrollPct(pct);
    };

    calc();
    window.addEventListener('scroll', calc, { passive: true });
    window.addEventListener('resize', calc, { passive: true });
    return () => {
      window.removeEventListener('scroll', calc);
      window.removeEventListener('resize', calc);
    };
  }, [loaded]);

  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-[3px]">
      <div
        className="h-full"
        style={{
          width: `${scrollPct}%`,
          background: 'linear-gradient(90deg, var(--gold), var(--gold-secondary), var(--gold))',
          boxShadow: '0 0 12px rgba(232,168,32,0.6), 0 0 24px rgba(232,168,32,0.3)',
          transition: loaded ? 'width 0.1s ease-out' : 'width 0.2s ease-out',
        }}
      />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${scrollPct}%` }}>
        <div className="progress-sheen" />
      </div>
    </div>
  );
}
