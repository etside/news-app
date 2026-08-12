import { useState } from 'react';
import GestureNav from '../shared/GestureNav';
import UrgencyBadge from '../shared/UrgencyBadge';
import TopProgressBar from '../shared/TopProgressBar';
import { ARTICLES, CATEGORIES, SECTIONS, type Section, type Article } from '../../data/articles';

export default function LayoutFour() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSection, setActiveSection] = useState<Section>('home');
  const sectionIndex = SECTIONS.findIndex(s => s.key === activeSection);

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  const topStories = filtered.slice(0, 3);
  const rest = filtered.slice(3);

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

        {/* Cinematic poster cards - top 3 stories */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gold rounded-full" />
            <h2 className="font-headline text-lg font-bold">Top Stories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topStories.map((article, i) => (
              <PosterCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </div>

        {/* Remaining stories in vertical list */}
        {rest.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gold-secondary rounded-full" />
              <h2 className="font-headline text-lg font-bold">More News</h2>
            </div>
            <div className="space-y-3">
              {rest.map(article => (
                <ListCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
      </GestureNav>
    </div>
  );
}

function PosterCard({ article, index }: { article: Article; index: number }) {
  const isMain = index === 0;

  return (
    <article className={`relative overflow-hidden rounded-xl bg-surface group cursor-pointer card-lift ${
      article.urgency === 'breaking' ? 'card-breaking' : 'border border-border'
    } ${isMain ? 'sm:row-span-2' : ''}`}>
      <div className="overflow-hidden">
        <img
          src={article.image}
          alt=""
          className={`w-full object-cover group-hover:scale-105 transition-transform duration-700 ${
            isMain ? 'h-64 sm:h-full' : 'h-48'
          }`}
          loading="lazy"
        />
      </div>
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent ${
        isMain ? '' : ''
      }`} />
      <div className="absolute bottom-0 p-4 sm:p-5">
        <UrgencyBadge urgency={article.urgency} />
        <h3 className={`font-headline text-white leading-tight mb-1.5 ${
          isMain ? 'text-xl sm:text-2xl font-bold' : 'text-base font-semibold line-clamp-2'
        }`}>
          {article.title}
        </h3>
        {isMain && (
          <p className="text-white/60 text-sm line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-white/40 text-xs">{article.time}</span>
          <span className="text-gold text-xs font-medium">{article.category}</span>
        </div>
      </div>
      {/* Cinematic film grain overlay */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />
    </article>
  );
}

function ListCard({ article }: { article: Article }) {
  return (
    <article className={`flex gap-4 p-3 rounded-xl bg-surface hover:bg-surface-2 transition-all cursor-pointer group border border-border ${
      article.urgency === 'breaking' ? 'card-breaking' : ''
    }`}>
      <div className="w-28 h-20 flex-shrink-0 overflow-hidden rounded-lg">
        <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <UrgencyBadge urgency={article.urgency} />
        <h3 className={`font-headline text-sm leading-snug line-clamp-2 mt-1 ${
          article.urgency === 'breaking' ? 'font-bold' :
          article.urgency === 'high' ? 'font-semibold' :
          'font-medium'
        }`}>
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-text-muted text-xs">{article.time}</span>
          <span className="text-gold text-xs">{article.category}</span>
        </div>
      </div>
    </article>
  );
}
