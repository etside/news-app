import { useState } from 'react';
import GestureNav from '../shared/GestureNav';
import UrgencyBadge from '../shared/UrgencyBadge';
import TopProgressBar from '../shared/TopProgressBar';
import { ARTICLES, SECTIONS, type Section, type Article } from '../../data/articles';

const TOPIC_CHIPS = [
  { id: 'All', label: 'All', icon: '🌐' },
  { id: 'Politics', label: 'Politics', icon: '🏛️' },
  { id: 'Economy', label: 'Economy', icon: '📈' },
  { id: 'Technology', label: 'Technology', icon: '💻' },
  { id: 'Sports', label: 'Sports', icon: '⚽' },
  { id: 'Culture', label: 'Culture', icon: '🎭' },
  { id: 'Environment', label: 'Environment', icon: '🌿' },
  { id: 'Health', label: 'Health', icon: '🏥' },
  { id: 'Education', label: 'Education', icon: '🎓' },
];

export default function LayoutThree() {
  const [activeTopic, setActiveTopic] = useState('All');
  const [activeSection, setActiveSection] = useState<Section>('home');
  const sectionIndex = SECTIONS.findIndex(s => s.key === activeSection);

  const filtered = activeTopic === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeTopic);

  const featured = activeTopic === 'All' ? ARTICLES.find(a => a.featured) : null;

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

        {/* Interactive topic chips - circular, prominent */}
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 px-1">
            {TOPIC_CHIPS.map(chip => (
              <button
                key={chip.id}
                onClick={() => setActiveTopic(chip.id)}
                className="flex flex-col items-center gap-2 min-w-[72px] group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                  activeTopic === chip.id
                    ? 'bg-gold text-black scale-110 shadow-lg'
                    : 'bg-surface-2 text-text-secondary hover:bg-surface-3 hover:scale-105'
                }`}
                  style={activeTopic === chip.id ? { boxShadow: '0 0 20px rgba(232,168,32,0.4)' } : undefined}
                >
                  {chip.icon}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTopic === chip.id ? 'text-gold' : 'text-text-muted'
                }`}>
                  {chip.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured && <FeaturedCardTopic article={featured} />}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filtered.map(article => (
            <ArticleCardTopic key={article.id} article={article} />
          ))}
        </div>
      </GestureNav>
    </div>
  );
}

function FeaturedCardTopic({ article }: { article: Article }) {
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

function ArticleCardTopic({ article }: { article: Article }) {
  if (article.featured) return null;

  return (
    <article className={`rounded-xl overflow-hidden bg-surface hover:bg-surface-2 transition-all cursor-pointer group card-lift border border-border ${
      article.urgency === 'breaking' ? 'card-breaking' : ''
    }`}>
      <div className="overflow-hidden">
        <img src={article.image} alt="" className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
