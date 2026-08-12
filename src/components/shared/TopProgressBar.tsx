import { useState, useEffect } from 'react';

export default function TopProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

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
      timers.push(setTimeout(() => setProgress(p), d));
    });
    timers.push(setTimeout(() => setVisible(false), 1200));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-[3px]">
      <div
        className="h-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--gold), var(--gold-secondary), var(--gold))',
          boxShadow: '0 0 12px rgba(232,168,32,0.6), 0 0 24px rgba(232,168,32,0.3)',
        }}
      />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${progress}%` }}>
        <div className="progress-sheen" />
      </div>
    </div>
  );
}
