import { useState } from 'react';
import GestureNav from '../shared/GestureNav';
import UrgencyBadge from '../shared/UrgencyBadge';
import TopProgressBar from '../shared/TopProgressBar';
import { ARTICLES, CATEGORIES, SECTIONS, type Section, type Article } from '../../data/articles';

export default function LayoutTwo() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSection, setActiveSection] = useState<Section>('home');
  const sectionIndex = SECTIONS.findIndex(s => s.key === activeSection);

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  const featured = activeCategory === 'All' ? ARTICLES.find(a => a.featured) : null;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <TopProgressBar />
      <GestureNav activeSection={activeSection} onSectionChange={setActiveSection}>
        {sectionIndex === 0 && (
          <div className="flex items-center justify-center gap-2 mb-4 text-text-muted text-xs">
            <span className="swipe-hint">←</span>
            <span>Swipe or use arrow keys to navigate sections</span>
            <span className="swipe-hint">→</span>
          </div>
        )}

        <div className="mb-6">
          <h1 className="font-headline text-2xl sm:text-3xl font-bold">
            {SECTIONS[sectionIndex].label}
          </h1>
          <div className="w-12 h-0.5 bg-gold mt-2 rounded-full" />
        </div>

        {/* Category pills - sharp edges, high contrast */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-gold text-black border-gold'
                  : 'border-border-strong text-text-secondary hover:border-gold hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured - sharp corners, high contrast */}
        {featured && <FeaturedCardHighContrast article={featured} />}

        {/* Grid layout - sharp cards, no rounding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mt-6">
          {filtered.map(article => (
            <ArticleCardHighContrast key={article.id} article={article} />
          ))}
        </div>
      </GestureNav>
    </div>
  );
}

function FeaturedCardHighContrast({ article }: { article: Article }) {
  return (
    <article className="relative overflow-hidden border-2 border-breaking bg-surface group cursor-pointer">
      <img src={article.image} alt="" className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 p-5 sm:p-6">
        <UrgencyBadge urgency={article.urgency} />
        <h2 className="font-headline text-2xl sm:text-3xl font-black text-white leading-tight mb-2 tracking-tight">
          {article.title}
        </h2>
        <p className="text-white/80 text-sm line-clamp-2 font-medium">{article.excerpt}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{article.time}</span>
          <span className="text-white/30 text-xs">|</span>
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{article.category}</span>
        </div>
      </div>
    </article>
  );
}

function ArticleCardHighContrast({ article }: { article: Article }) {
  if (article.featured) return null;

  return (
    <article className={`overflow-hidden border border-border-strong bg-surface hover:bg-surface-2 transition-all cursor-pointer group ${
      article.urgency === 'breaking' ? 'border-breaking border-2' :
      article.urgency === 'high' ? 'border-high' : ''
    }`}>
      <div className="overflow-hidden">
        <img src={article.image} alt="" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="p-4">
        <UrgencyBadge urgency={article.urgency} />
        <h3 className={`font-headline leading-snug line-clamp-3 mt-1.5 ${
          article.urgency === 'breaking' ? 'text-lg font-black tracking-tight' :
          article.urgency === 'high' ? 'font-bold' :
          article.urgency === 'normal' ? 'font-semibold' :
          'font-medium'
        }`}>
          {article.title}
        </h3>
        <p className="text-text-secondary text-sm mt-1.5 line-clamp-2 font-medium">{article.excerpt}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-strong">
          <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">{article.time}</span>
          <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">{article.category}</span>
        </div>
      </div>
    </article>
  );
}
