import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import SplashScreen from './components/SplashScreen';

/* ── Mock article data ─────────────────────────────────────────────── */
const ARTICLES = [
  { id: 1, category: 'Politics', title: 'Bangladesh Parliament Approves New Digital Governance Bill', excerpt: 'The landmark legislation aims to digitize all government services by 2028, making Bangladesh a leader in South Asian e-governance.', image: 'https://picsum.photos/seed/dhaka1/600/400', time: '2h ago', featured: true },
  { id: 2, category: 'Economy', title: 'Dhaka Stock Exchange Hits Record High Amid Foreign Investment Surge', excerpt: 'Foreign direct investment reaches $4.2 billion in the first half of 2026.', image: 'https://picsum.photos/seed/dhaka2/600/350', time: '3h ago' },
  { id: 3, category: 'Technology', title: 'Bangladeshi Startup Raises $50M Series B for AI-Powered Agriculture', excerpt: 'The Dhaka-based company uses satellite imagery and AI to help farmers optimize crop yields.', image: 'https://picsum.photos/seed/dhaka3/600/500', time: '4h ago' },
  { id: 4, category: 'Sports', title: 'Bangladesh Cricket Team Prepares for World Cup Semifinal', excerpt: 'The Tigers are confident after a dominant group stage performance.', image: 'https://picsum.photos/seed/dhaka4/600/300', time: '5h ago' },
  { id: 5, category: 'Culture', title: 'UNESCO Recognizes Bangladeshi Jamdani Weaving as Intangible Heritage', excerpt: 'The centuries-old textile art receives global recognition for its intricate craftsmanship.', image: 'https://picsum.photos/seed/dhaka5/600/450', time: '6h ago' },
  { id: 6, category: 'Environment', title: 'Sundarbans Mangrove Restoration Project Shows Promising Results', excerpt: 'Satellite data reveals 12% increase in mangrove cover over the past two years.', image: 'https://picsum.photos/seed/dhaka6/600/380', time: '7h ago' },
  { id: 7, category: 'Health', title: 'New Medical College Opens in Chattogram to Serve Southern Region', excerpt: 'The 500-bed facility will provide specialized healthcare to millions.', image: 'https://picsum.photos/seed/dhaka7/600/420', time: '8h ago' },
  { id: 8, category: 'Education', title: 'Dhaka University Launches South Asia\'s First Quantum Computing Lab', excerpt: 'The lab will focus on research in cryptography and materials science.', image: 'https://picsum.photos/seed/dhaka8/600/350', time: '9h ago' },
  { id: 9, category: 'Politics', title: 'Metro Rail Phase 3 Construction Begins in Uttara', excerpt: 'The extension will connect the northern suburbs to the city center.', image: 'https://picsum.photos/seed/dhaka9/600/480', time: '10h ago' },
  { id: 10, category: 'Economy', title: 'Garment Industry Adopts Sustainable Manufacturing Practices', excerpt: 'Major factories transition to renewable energy and zero-waste production.', image: 'https://picsum.photos/seed/dhaka10/600/320', time: '11h ago' },
  { id: 11, category: 'Technology', title: 'Bangladesh Launches National AI Strategy 2030', excerpt: 'The comprehensive plan outlines ethical AI development across all sectors.', image: 'https://picsum.photos/seed/dhaka11/600/400', time: '12h ago' },
  { id: 12, category: 'Culture', title: 'Pohela Boishakh Celebrations Draw Millions to Ramna Batamul', excerpt: 'The Bengali New Year is marked by music, art, and traditional cuisine.', image: 'https://picsum.photos/seed/dhaka12/600/360', time: '1d ago' },
];

const CATEGORIES = ['All', 'Politics', 'Economy', 'Technology', 'Sports', 'Culture', 'Environment', 'Health', 'Education'];

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

function MainApp() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">Skip to content</a>

      {/* ── Top bar (glass) ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-headline text-xl font-bold text-gold">DH</span>
            <span className="font-headline text-lg font-semibold hidden sm:inline">Dhaka Heralds</span>
          </div>
          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </header>

      {/* ── Category pills ──────────────────────────────────────── */}
      <nav className="sticky top-14 z-30 glass border-t border-border" aria-label="Categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-none">
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
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────────── */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Featured article */}
        {filtered.length > 0 && filtered[0].featured && (
          <FeaturedCard article={filtered[0]} />
        )}

        {/* Masonry grid */}
        <div className="masonry-grid mt-6">
          {filtered.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </main>

      {/* ── Bottom nav (mobile) ─────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 glass border-t border-border md:hidden" aria-label="Bottom navigation">
        <div className="flex justify-around py-2">
          {['Home', 'Discover', 'Saved', 'Profile'].map((label, i) => (
            <button key={label} className="flex flex-col items-center gap-0.5 px-3 py-1">
              <span className={`text-xs ${i === 0 ? 'text-gold' : 'text-text-muted'}`}>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}

/* ── Featured card ──────────────────────────────────────────────────── */
function FeaturedCard({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <article className="relative rounded-2xl overflow-hidden bg-surface group cursor-pointer">
      <img src={article.image} alt="" className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 p-5 sm:p-6">
        <span className="inline-block px-3 py-1 rounded-full bg-gold text-black text-xs font-semibold mb-3">
          {article.category}
        </span>
        <h2 className="font-headline text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
          {article.title}
        </h2>
        <p className="text-white/70 text-sm line-clamp-2">{article.excerpt}</p>
        <span className="text-white/50 text-xs mt-2 block">{article.time}</span>
      </div>
    </article>
  );
}

/* ── Article card (masonry item) ────────────────────────────────────── */
function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  if (article.featured) return null;

  return (
    <article className="masonry-item rounded-xl overflow-hidden bg-surface hover:bg-surface-2 transition-colors cursor-pointer group">
      <div className="overflow-hidden">
        <img
          src={article.image}
          alt=""
          className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <span className="text-gold text-xs font-semibold uppercase tracking-wider">{article.category}</span>
        <h3 className="font-headline text-base font-semibold mt-1.5 leading-snug line-clamp-3">
          {article.title}
        </h3>
        <p className="text-text-secondary text-sm mt-1.5 line-clamp-2">{article.excerpt}</p>
        <span className="text-text-muted text-xs mt-2 block">{article.time}</span>
      </div>
    </article>
  );
}
