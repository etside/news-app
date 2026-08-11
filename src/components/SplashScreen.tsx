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

/* ── Mobile: centered GIF intro (same as desktop, smaller) ───────── */
function MobileSplash({ phase }: { phase: 'enter' | 'exit' }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden ${
        phase === 'exit' ? 'splash-gif-exit' : 'splash-gif-enter'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <img
          src={`${import.meta.env.BASE_URL}dhaka_heralds_850ms_intro_v3_clean_hole_gap.gif`}
          alt="Dhaka Heralds intro"
          className="w-[min(80vw,320px)] h-auto rounded-2xl"
          style={{ filter: 'drop-shadow(0 0 40px rgba(200,149,26,0.25))' }}
        />
      </div>
    </div>
  );
}
