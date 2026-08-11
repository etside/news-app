import { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import SplashScreen from './components/SplashScreen';

/* ── Top progress bar with golden sheen ─────────────────────────────── */
function TopProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fast loading simulation
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
      {/* Shiny sheen overlay */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${progress}%` }}
      >
        <div className="progress-sheen" />
      </div>
    </div>
  );
}

/* ── Article data with urgency levels ──────────────────────────────── */
const ARTICLES = [
  { id: 1, category: 'Politics', title: 'Bangladesh Parliament Approves New Digital Governance Bill', excerpt: 'The landmark legislation aims to digitize all government services by 2028, making Bangladesh a leader in South Asian e-governance.', image: 'https://picsum.photos/seed/dhaka1/600/400', time: '2h ago', urgency: 'breaking' as const, featured: true },
  { id: 2, category: 'Economy', title: 'Dhaka Stock Exchange Hits Record High Amid Foreign Investment Surge', excerpt: 'Foreign direct investment reaches $4.2 billion in the first half of 2026.', image: 'https://picsum.photos/seed/dhaka2/600/350', time: '3h ago', urgency: 'high' as const },
  { id: 3, category: 'Technology', title: 'Bangladeshi Startup Raises $50M Series B for AI-Powered Agriculture', excerpt: 'The Dhaka-based company uses satellite imagery and AI to help farmers optimize crop yields.', image: 'https://picsum.photos/seed/dhaka3/600/500', time: '4h ago', urgency: 'normal' as const },
  { id: 4, category: 'Sports', title: 'Bangladesh Cricket Team Prepares for World Cup Semifinal', excerpt: 'The Tigers are confident after a dominant group stage performance.', image: 'https://picsum.photos/seed/dhaka4/600/300', time: '5h ago', urgency: 'normal' as const },
  { id: 5, category: 'Culture', title: 'UNESCO Recognizes Bangladeshi Jamdani Weaving as Intangible Heritage', excerpt: 'The centuries-old textile art receives global recognition for its intricate craftsmanship.', image: 'https://picsum.photos/seed/dhaka5/600/450', time: '6h ago', urgency: 'low' as const },
  { id: 6, category: 'Environment', title: 'Sundarbans Mangrove Restoration Project Shows Promising Results', excerpt: 'Satellite data reveals 12% increase in mangrove cover over the past two years.', image: 'https://picsum.photos/seed/dhaka6/600/380', time: '7h ago', urgency: 'normal' as const },
  { id: 7, category: 'Health', title: 'New Medical College Opens in Chattogram to Serve Southern Region', excerpt: 'The 500-bed facility will provide specialized healthcare to millions.', image: 'https://picsum.photos/seed/dhaka7/600/420', time: '8h ago', urgency: 'low' as const },
  { id: 8, category: 'Education', title: 'Dhaka University Launches South Asia\'s First Quantum Computing Lab', excerpt: 'The lab will focus on research in cryptography and materials science.', image: 'https://picsum.photos/seed/dhaka8/600/350', time: '9h ago', urgency: 'high' as const },
  { id: 9, category: 'Politics', title: 'Metro Rail Phase 3 Construction Begins in Uttara', excerpt: 'The extension will connect the northern suburbs to the city center.', image: 'https://picsum.photos/seed/dhaka9/600/480', time: '10h ago', urgency: 'normal' as const },
  { id: 10, category: 'Economy', title: 'Garment Industry Adopts Sustainable Manufacturing Practices', excerpt: 'Major factories transition to renewable energy and zero-waste production.', image: 'https://picsum.photos/seed/dhaka10/600/320', time: '11h ago', urgency: 'low' as const },
  { id: 11, category: 'Technology', title: 'Bangladesh Launches National AI Strategy 2030', excerpt: 'The comprehensive plan outlines ethical AI development across all sectors.', image: 'https://picsum.photos/seed/dhaka11/600/400', time: '12h ago', urgency: 'high' as const },
  { id: 12, category: 'Culture', title: 'Pohela Boishakh Celebrations Draw Millions to Ramna Batamul', excerpt: 'The Bengali New Year is marked by music, art, and traditional cuisine.', image: 'https://picsum.photos/seed/dhaka12/600/360', time: '1d ago', urgency: 'low' as const },
];

type Urgency = 'breaking' | 'high' | 'normal' | 'low';
type Section = 'home' | 'analysis' | 'opinion' | 'world' | 'tech';

const CATEGORIES = ['All', 'Politics', 'Economy', 'Technology', 'Sports', 'Culture', 'Environment', 'Health', 'Education'];

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'opinion', label: 'Opinion' },
  { key: 'world', label: 'World' },
  { key: 'tech', label: 'Tech' },
];

/* ── App ────────────────────────────────────────────────────────────── */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background text-text-primary">
        {showSplash ? (
          <SplashScreen onDone={() => setShowSplash(false)} />
        ) : (
          <MainApp />
        )}
      </div>
    </ThemeProvider>
  );
}

/* ── Logo component with theme-based switching ──────────────────────── */
function DhLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  // Light theme: gold logo (no circle). Dark theme: white circle logo.
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

/* ── Main App ───────────────────────────────────────────────────────── */
function MainApp() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [showNav, setShowNav] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const sectionIndex = SECTIONS.findIndex(s => s.key === activeSection);

  useEffect(() => setMounted(true), []);

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  // Gesture: swipe left/right to change section
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Only register horizontal swipes (ignore vertical scrolls)
    if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && sectionIndex < SECTIONS.length - 1) {
        setActiveSection(SECTIONS[sectionIndex + 1].key);
      } else if (deltaX > 0 && sectionIndex > 0) {
        setActiveSection(SECTIONS[sectionIndex - 1].key);
      }
    }
  }, [sectionIndex]);

  // Keyboard gesture: arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && sectionIndex < SECTIONS.length - 1) {
        setActiveSection(SECTIONS[sectionIndex + 1].key);
      } else if (e.key === 'ArrowLeft' && sectionIndex > 0) {
        setActiveSection(SECTIONS[sectionIndex - 1].key);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sectionIndex]);

  return (
    <div
      className="min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top progress bar ────────────────────────────────────── */}
      <TopProgressBar />

      {/* ── Top bar (glass) ─────────────────────────────────────── */}
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
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 mr-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 pulse-ring" />
              </div>
              <span className="text-xs font-medium text-red-500 uppercase tracking-wider">Live</span>
            </div>

            {/* Theme toggle */}
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

            {/* Menu toggle */}
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

      {/* ── Section nav (gesture-driven tabs) ────────────────────── */}
      <nav className="sticky top-14 z-30 glass border-t border-border" aria-label="Sections">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-none">
            {SECTIONS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === s.key
                    ? 'bg-gold text-black'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                {s.label}
              </button>
            ))}
            {/* Gesture hint dots */}
            <div className="flex items-center gap-1 ml-3 pl-3 border-l border-border">
              {SECTIONS.map((s, i) => (
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

      {/* ── Main content ────────────────────────────────────────── */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 section-enter" key={activeSection}>
        {/* Swipe hint on first visit */}
        {sectionIndex === 0 && (
          <div className="flex items-center justify-center gap-2 mb-4 text-text-muted text-xs">
            <span className="swipe-hint">←</span>
            <span>Swipe or use arrow keys to navigate sections</span>
            <span className="swipe-hint">→</span>
          </div>
        )}

        {/* Section header */}
        <div className="mb-6">
          <h1 className="font-headline text-2xl sm:text-3xl font-bold">
            {SECTIONS[sectionIndex].label}
          </h1>
          <div className="w-12 h-0.5 bg-gold mt-2 rounded-full" />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-gold text-black'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured article */}
        {activeCategory === 'All' && filtered.length > 0 && filtered[0].featured && (
          <FeaturedCard article={filtered[0]} />
        )}

        {/* Masonry grid */}
        <div className="masonry-grid mt-6">
          {filtered.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </main>

      {/* ── Bottom nav (mobile gesture bar) ──────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border md:hidden" aria-label="Bottom navigation">
        <div className="flex justify-around py-2">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
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

/* ── Section icons ──────────────────────────────────────────────────── */
function SectionIcon({ section, active }: { section: Section; active: boolean }) {
  const color = active ? 'var(--gold)' : 'var(--text-muted)';
  const size = 20;

  switch (section) {
    case 'home':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'analysis':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
    case 'opinion':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
    case 'world':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
    case 'tech':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
  }
}

/* ── Featured card ──────────────────────────────────────────────────── */
function FeaturedCard({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <article className="relative rounded-2xl overflow-hidden bg-surface group cursor-pointer card-lift card-breaking">
      <img src={article.image} alt="" className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 p-5 sm:p-6">
        <UrgencyBadge urgency={article.urgency} />
        <h2 className="font-headline text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
          {article.title}
        </h2>
        <p className="text-white/70 text-sm line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-white/50 text-xs">{article.time}</span>
          <span className="text-white/30 text-xs">|</span>
          <span className="text-white/50 text-xs">{article.category}</span>
        </div>
      </div>
    </article>
  );
}

/* ── Article card ────────────────────────────────────────────────────── */
function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  if (article.featured) return null;

  return (
    <article className={`masonry-item rounded-xl overflow-hidden bg-surface hover:bg-surface-2 transition-all cursor-pointer group card-lift ${
      article.urgency === 'breaking' ? 'card-breaking' : ''
    }`}>
      <div className="overflow-hidden">
        <img
          src={article.image}
          alt=""
          className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <UrgencyBadge urgency={article.urgency} />
        <h3 className={`font-headline text-base leading-snug line-clamp-3 mt-1.5 ${
          article.urgency === 'breaking' ? 'text-lg font-bold' :
          article.urgency === 'high' ? 'font-semibold' :
          article.urgency === 'normal' ? 'font-medium' :
          'font-normal'
        }`}>
          {article.title}
        </h3>
        <p className="text-text-secondary text-sm mt-1.5 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-text-muted text-xs">{article.time}</span>
          <span className="text-text-muted text-xs">{article.category}</span>
        </div>
      </div>
    </article>
  );
}

/* ── Urgency badge ──────────────────────────────────────────────────── */
function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  if (urgency === 'normal') return null;

  const labels = { breaking: 'Breaking', high: 'Trending', low: 'Analysis' };
  const classes = {
    breaking: 'urgency-breaking',
    high: 'urgency-high',
    low: 'urgency-low',
  };

  return (
    <span className={`inline-block ${classes[urgency]} text-xs font-semibold uppercase tracking-wider`}>
      {labels[urgency]}
    </span>
  );
}
