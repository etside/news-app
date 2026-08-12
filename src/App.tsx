import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import SettingsPanel from './components/SettingsPanel';
import AdminPanel from './components/admin/AdminPanel';
import { LayoutProvider, useLayout } from './contexts/LayoutContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LayoutOne from './components/layouts/LayoutOne';
import LayoutTwo from './components/layouts/LayoutTwo';
import LayoutThree from './components/layouts/LayoutThree';
import LayoutFour from './components/layouts/LayoutFour';
import LayoutFive from './components/layouts/LayoutFive';

const ONBOARDING_KEY = 'dh-onboarding-v2';

// SPA redirect handler for GitHub Pages
// 404.html redirects to index.html?/path — we parse that and navigate
function useGitHubPagesRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const search = window.location.search;
    if (search && search.startsWith('?/')) {
      const redirectPath = search
        .slice(1)                          // remove '?'
        .replace(/~and~/g, '&')            // undo & encoding
        .replace(/~plus~/g, '+');          // undo + encoding (if used)
      // Clean up the URL without triggering a navigation loop
      window.history.replaceState({}, '', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);
}

function LayoutRouter() {
  const { layout } = useLayout();
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle GitHub Pages SPA redirect (404.html -> ?/path)
  useGitHubPagesRedirect();

  // Listen for settings toggle from keyboard shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSettings(s => !s);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const layoutMap = {
    'default': <LayoutOne />,
    'high-contrast': <LayoutTwo />,
    'topics': <LayoutThree />,
    'cinematic': <LayoutFour />,
    'gesture': <LayoutFive />,
  };

  // Admin/Panel route
  if (location.pathname === '/admin' || location.pathname === '/panel') {
    return (
      <>
        <AdminPanel onBack={() => navigate('/')} />
        <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
      </>
    );
  }

  return (
    <>
      {layoutMap[layout]}
      <SettingsButton onClick={() => setShowSettings(true)} onAdmin={() => navigate('/admin')} />
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

function SettingsButton({ onClick, onAdmin }: { onClick: () => void; onAdmin: () => void }) {
  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 md:bottom-6">
      <button
        onClick={onAdmin}
        className="w-10 h-10 rounded-full bg-surface border border-border-strong flex items-center justify-center hover:bg-surface-2 transition-all shadow-lg"
        aria-label="Admin Panel"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </button>
      <button
        onClick={onClick}
        className="w-10 h-10 rounded-full bg-surface border border-border-strong flex items-center justify-center hover:bg-surface-2 transition-all shadow-lg"
        aria-label="Settings"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </button>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (done) setOnboardingDone(true);
    } catch {}
  }, []);

  const handleSplashDone = () => {
    setShowSplash(false);
    if (!onboardingDone) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, '1');
    } catch {}
    setOnboardingDone(true);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <LayoutProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background text-text-primary">
              {showSplash ? (
                <SplashScreen onDone={handleSplashDone} />
              ) : showOnboarding ? (
                <Onboarding onDone={handleOnboardingDone} />
              ) : (
                <LayoutRouter />
              )}
            </div>
          </BrowserRouter>
        </LayoutProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
