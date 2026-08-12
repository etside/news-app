import { useState } from 'react';
import GestureNav from '../shared/GestureNav';
import UrgencyBadge from '../shared/UrgencyBadge';
import TopProgressBar from '../shared/TopProgressBar';
import EmbedCard from '../EmbedCard';
import { ARTICLES, CATEGORIES, SECTIONS, type Section, type Article } from '../../data/articles';

export default function LayoutOne() {
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
        {/* Swipe hint */}
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
        {featured && <FeaturedCard article={featured} />}

        {/* Masonry grid */}
        <div className="masonry-grid mt-6">
          {filtered.map(article => (
            article.embedUrl ? (
              <div key={article.id} className="masonry-item">
                <EmbedCard
                  embedUrl={article.embedUrl}
                  thumbnailUrl={article.image}
                  mediaType={article.mediaType || 'image'}
                  owner={article.owner!}
                  engagement={article.engagement || { likes: 0, comments: 0 }}
                  caption={article.excerpt}
                />
              </div>
            ) : (
              <ArticleCard key={article.id} article={article} />
            )
          ))}
        </div>
      </GestureNav>
    </div>
  );
}

function FeaturedCard({ article }: { article: Article }) {
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

function ArticleCard({ article }: { article: Article }) {
  if (article.featured) return null;

  return (
    <article className={`masonry-item rounded-xl overflow-hidden bg-surface hover:bg-surface-2 transition-all cursor-pointer group card-lift ${
      article.urgency === 'breaking' ? 'card-breaking' : ''
    }`}>
      <div className="overflow-hidden">
        <img src={article.image} alt="" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
