import { useState } from 'react';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background text-text-primary">
        {showSplash ? (
          <SplashMinimal onDone={() => setShowSplash(false)} />
        ) : (
          <main className="p-8">
            <h1 className="font-headline text-4xl font-bold">Dhaka Heralds</h1>
            <p className="text-text-secondary mt-2">Phase 1 — Scaffolding complete</p>
          </main>
        )}
      </div>
    </ThemeProvider>
  );
}

function SplashMinimal({ onDone }: { onDone: () => void }) {
  useState(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-headline text-5xl font-bold text-gold">DH</h1>
        <p className="text-text-secondary text-sm mt-2 tracking-widest uppercase">Dhaka Heralds</p>
      </div>
    </div>
  );
}
