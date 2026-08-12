import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type LayoutId = 'default' | 'high-contrast' | 'topics' | 'cinematic';

interface LayoutOption {
  id: LayoutId;
  name: string;
  description: string;
  preview: string;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'default',
    name: 'Classic Herald',
    description: 'Charcoal background with saffron accents, standard news card grid layout',
    preview: '📰',
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Dark mode with contrast-optimized text and sharp card boundaries',
    preview: '🔲',
  },
  {
    id: 'topics',
    name: 'Topic Explorer',
    description: 'Interactive circular chips for topic and category filtering',
    preview: '🔘',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Immersive dark theme with movie-style poster cards for top headlines',
    preview: '🎬',
  },
];

interface LayoutContextValue {
  layout: LayoutId;
  setLayout: (id: LayoutId) => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  layout: 'default',
  setLayout: () => {},
});

export function useLayout() {
  return useContext(LayoutContext);
}

const STORAGE_KEY = 'dh-layout-preference';

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayoutState] = useState<LayoutId>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LAYOUT_OPTIONS.some(o => o.id === stored)) {
        return stored as LayoutId;
      }
    } catch {}
    return 'default';
  });

  const setLayout = (id: LayoutId) => {
    setLayoutState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  };

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}
