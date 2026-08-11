import { useState, useEffect, useCallback } from 'react';

interface SplashScreenProps {
  onDone: () => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');

  const finish = useCallback(() => {
    setPhase('exit');
    setTimeout(onDone, 400);
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(finish, isMobile ? 2800 : 3500);
    return () => clearTimeout(t);
  }, [isMobile, finish]);

  if (isMobile) {
    return <MobileSplash phase={phase} />;
  }
  return <DesktopSplash phase={phase} />;
}

/* ── Desktop / Tablet: centered GIF intro ────────────────────────── */
function DesktopSplash({ phase }: { phase: 'enter' | 'exit' }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background ${
        phase === 'exit' ? 'splash-gif-exit' : 'splash-gif-enter'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <img
          src={`${import.meta.env.BASE_URL}dhaka_heralds_850ms_intro_v3_clean_hole_gap.gif`}
          alt="Dhaka Heralds intro"
          className="w-[min(80vw,420px)] h-auto rounded-2xl"
          style={{ filter: 'drop-shadow(0 0 40px rgba(200,149,26,0.25))' }}
        />
      </div>
    </div>
  );
}

/* ── Mobile: corner-to-corner gold racing lines + logo ──────────── */
function MobileSplash({ phase }: { phase: 'enter' | 'exit' }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden ${
        phase === 'exit' ? 'splash-gif-exit' : ''
      }`}
    >
      {/* Two racing gold lines — top-left to bottom-right */}
      <div
        className="absolute top-4 left-4 h-[2px] w-24 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #C8951A, #F0B429)',
          animation: 'raceLine1 1.8s ease-in-out forwards',
          boxShadow: '0 0 12px 4px rgba(200,149,26,0.4), 0 0 24px 8px rgba(240,180,41,0.2)',
        }}
      />
      <div
        className="absolute top-4 left-4 h-[2px] w-24 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #F0B429, #C8951A)',
          animation: 'raceLine2 1.8s 0.15s ease-in-out forwards',
          boxShadow: '0 0 12px 4px rgba(240,180,41,0.4), 0 0 24px 8px rgba(200,149,26,0.2)',
        }}
      />

      {/* Bottom-right corner burst when lines arrive */}
      <div
        className="absolute bottom-4 right-4 w-8 h-8 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(200,149,26,0.6), transparent)',
          animation: 'cornerBurst 0.6s 1.7s ease-out forwards',
          opacity: 0,
        }}
      />

      {/* Logo reveal after lines connect */}
      <div
        className="relative z-10 text-center"
        style={{
          animation: 'logoReveal 0.8s 2s ease-out forwards',
          opacity: 0,
        }}
      >
        <h1
          className="font-headline text-6xl font-bold text-gold"
          style={{ animation: 'logoGlow 2s 2.4s ease-in-out infinite' }}
        >
          DH
        </h1>
        <p className="text-text-secondary text-xs mt-2 tracking-[0.3em] uppercase">
          Dhaka Heralds
        </p>
      </div>
    </div>
  );
}
