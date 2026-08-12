import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  resolvedTheme: string;
  themes: string[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
  themes: ['light', 'dark'],
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'dark',
  enableSystem = true,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('theme') || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [enableSystem]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const resolved = theme === 'system' ? systemTheme : theme;

    // Disable transitions if needed
    if (disableTransitionOnChange) {
      const style = document.createElement('style');
      style.textContent = '*,*::before,*::after{transition:none!important}';
      document.head.appendChild(style);
      // Force reflow then remove
      void document.body.offsetHeight;
      setTimeout(() => document.head.removeChild(style), 0);
    }

    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    } else {
      root.setAttribute(attribute, resolved);
    }

    // Set color-scheme for native elements
    if (['light', 'dark'].includes(resolved)) {
      root.style.colorScheme = resolved;
    }
  }, [theme, systemTheme, attribute, disableTransitionOnChange]);

  const setTheme = useCallback((t: string) => {
    setThemeState(t);
    try {
      localStorage.setItem('theme', t);
    } catch {}
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme,
    resolvedTheme,
    themes: enableSystem ? ['light', 'dark', 'system'] : ['light', 'dark'],
  }), [theme, setTheme, resolvedTheme, enableSystem]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
