import { useState } from 'react';
import { useTheme } from 'next-themes';
import TopProgressBar from '../shared/TopProgressBar';
import EmbedCard from '../EmbedCard';
import OwnershipBadge from '../OwnershipBadge';
import { ARTICLES, SECTIONS, type Section, type Article, type Urgency } from '../../data/articles';

const CATEGORIES = ['Trending', 'Health', 'Sports', 'Finance', 'Politics', 'Tech', 'Culture', 'World', 'Business'];

type View = 'feed' | 'saved' | 'detail';

export default function LayoutFive() {
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [view, setView] = useState<View>('feed');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [activeSection, setActiveSection] = useState<Section>('home');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useState(() => { setTimeout(() => setMounted(true), 0); });

  const filtered = activeCategory === 'Trending'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  const saved = ARTICLES.filter(a => savedIds.has(a.id));

  const toggleSave = (id: number) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openDetail = (article: Article) => {
    setSelectedArticle(article);
    setView('detail');
  };

  if (view === 'detail' && selectedArticle) {
    return (
      <div className="min-h-screen bg-[#F7F6F1]">
        <TopProgressBar />
        <ArticleDetail
          article={selectedArticle}
          onBack={() => setView('feed')}
          isSaved={savedIds.has(selectedArticle.id)}
          onToggleSave={() => toggleSave(selectedArticle.id)}
        />
      </div>
    );
  }

  if (view === 'saved') {
    return (
      <div className="min-h-screen bg-[#F7F6F1]">
        <TopProgressBar />
        <SavedScreen
          articles={saved}
          onBack={() => setView('feed')}
          onOpen={openDetail}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F1]">
      <TopProgressBar />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-black/5">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0A0A0C] flex items-center justify-center">
              <span className="font-headline font-bold text-white text-xs">DH</span>
            </div>
            <div>
              <span className="font-headline text-base font-bold text-[#0A0A0C] leading-none block">Dhaka Heralds</span>
              <span className="text-[10px] text-[#8A8A84] uppercase tracking-widest">Analysis</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(mounted && theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-full bg-[#F0EFE8] flex items-center justify-center"
            >
              {mounted && theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <button
              onClick={() => setView('saved')}
              className="w-9 h-9 rounded-full bg-[#F0EFE8] flex items-center justify-center relative"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
              {savedIds.size > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF3B3B] text-white text-[9px] font-bold flex items-center justify-center">
                  {savedIds.size}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Category Carousel */}
      <div className="sticky top-14 z-30 bg-white border-b border-black/5">
        <div className="flex gap-1 px-4 py-2.5 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#0A0A0C] text-white'
                  : 'bg-[#F0EFE8] text-[#4A4A44] hover:bg-[#E4E3DA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <main className="px-4 py-4 pb-24">
        {/* Hero Article */}
        {filtered[0] && (
          <HeroCard article={filtered[0]} onOpen={() => openDetail(filtered[0])} />
        )}

        {/* Remaining articles */}
        <div className="mt-4 space-y-3">
          {filtered.slice(1).map(article => (
            article.embedUrl ? (
              <EmbedCard
                key={article.id}
                embedUrl={article.embedUrl}
                thumbnailUrl={article.image}
                mediaType={article.mediaType || 'image'}
                owner={article.owner!}
                engagement={article.engagement || { likes: 0, comments: 0 }}
                caption={article.excerpt}
              />
            ) : (
              <CompactCard
                key={article.id}
                article={article}
                onOpen={() => openDetail(article)}
                isSaved={savedIds.has(article.id)}
                onToggleSave={() => toggleSave(article.id)}
              />
            )
          ))}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-black/5">
        <div className="flex justify-around items-center h-14">
          {[
            { icon: 'home', label: 'Home', active: true },
            { icon: 'search', label: 'Search', active: false },
            { icon: 'bookmark', label: 'Saved', active: false, onClick: () => setView('saved') },
            { icon: 'bell', label: 'Alerts', active: false },
            { icon: 'user', label: 'Profile', active: false },
          ].map(tab => (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <NavIcon name={tab.icon} active={tab.active} />
              <span className={`text-[10px] font-medium ${tab.active ? 'text-[#0A0A0C]' : 'text-[#8A8A84]'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ── Hero Card ──────────────────────────────────────────────────── */
function HeroCard({ article, onOpen }: { article: Article; onOpen: () => void }) {
  return (
    <article onClick={onOpen} className="rounded-2xl overflow-hidden bg-white border border-black/5 cursor-pointer group" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="overflow-hidden relative">
        <img src={article.image} alt="" className="w-full h-56 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
        {article.embedUrl && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" strokeWidth="2"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="white" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>
            <span className="text-[10px] font-medium text-white">Instagram</span>
          </div>
        )}
        {article.mediaType === 'video' && (
          <div className="absolute bottom-3 right-3">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <LiveBadge urgency={article.urgency} />
          <span className="text-[10px] text-[#8A8A84] uppercase tracking-wider font-medium">{article.category}</span>
          <span className="text-[10px] text-[#8A8A84]">{article.time}</span>
        </div>
        <h2 className="font-headline text-xl sm:text-2xl font-black text-[#0A0A0C] leading-tight mb-2">
          {article.title}
        </h2>
        <p className="text-sm text-[#4A4A44] leading-relaxed line-clamp-2">{article.excerpt}</p>
        {article.owner ? (
          <OwnershipBadge owner={article.owner} timestamp={article.time} />
        ) : (
          <AuthorMeta />
        )}
        <EngagementBar likes={article.engagement?.likes} comments={article.engagement?.comments} />
      </div>
    </article>
  );
}

/* ── Compact Card ───────────────────────────────────────────────── */
function CompactCard({ article, onOpen, isSaved, onToggleSave }: { article: Article; onOpen: () => void; isSaved: boolean; onToggleSave: () => void }) {
  return (
    <article onClick={onOpen} className="flex gap-3 p-3 rounded-xl bg-white border border-black/5 cursor-pointer group" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <LiveBadge urgency={article.urgency} />
          <span className="text-[10px] text-[#8A8A84] uppercase tracking-wider font-medium">{article.category}</span>
          {article.embedUrl && (
            <span className="text-[10px] text-[#3897F0] font-medium flex items-center gap-0.5">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="#3897F0"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
              IG
            </span>
          )}
        </div>
        <h3 className="font-headline text-sm font-bold text-[#0A0A0C] leading-snug line-clamp-2 mb-1">
          {article.title}
        </h3>
        <div className="flex items-center justify-between">
          {article.owner ? (
            <OwnershipBadge owner={article.owner} timestamp={article.time} compact />
          ) : (
            <span className="text-[10px] text-[#8A8A84]">{article.time}</span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onToggleSave(); }}
            className="p-1 rounded-full hover:bg-[#F0EFE8] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? '#0A0A0C' : 'none'} stroke="#0A0A0C" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
        <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
    </article>
  );
}

/* ── Live Badge ─────────────────────────────────────────────────── */
function LiveBadge({ urgency }: { urgency: Urgency }) {
  if (urgency === 'normal' || urgency === 'low') return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
      urgency === 'breaking' ? 'bg-[#FF3B3B] text-white' : 'bg-[#FF8C42] text-white'
    }`}>
      {urgency === 'breaking' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      {urgency === 'breaking' ? 'Live' : 'Trending'}
    </span>
  );
}

/* ── Author Meta (editorial) ────────────────────────────────────── */
function AuthorMeta() {
  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#E4E3DA] flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#4A4A44]">DH</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-[#0A0A0C] block leading-none">Dhaka Heralds</span>
          <span className="text-[10px] text-[#8A8A84]">Editorial</span>
        </div>
      </div>
      <span className="px-3 py-1 rounded-full bg-[#F0EFE8] text-[10px] font-semibold text-[#0A0A0C]">
        Follow
      </span>
    </div>
  );
}

/* ── Engagement Bar ─────────────────────────────────────────────── */
function EngagementBar({ likes, comments }: { likes?: number; comments?: number }) {
  const [upvoted, setUpvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const displayLikes = likes !== undefined ? (upvoted ? likes + 1 : likes) : (upvoted ? 25 : 24);
  const displayComments = comments !== undefined ? comments : 12;

  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
      <div className="flex items-center gap-4">
        <button onClick={() => setUpvoted(!upvoted)} className="flex items-center gap-1 text-[#4A4A44] hover:text-[#0A0A0C] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill={upvoted ? '#0A0A0C' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
          <span className="text-xs font-medium">{displayLikes}</span>
        </button>
        <button className="flex items-center gap-1 text-[#4A4A44] hover:text-[#0A0A0C] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span className="text-xs font-medium">{displayComments}</span>
        </button>
        <button className="text-[#4A4A44] hover:text-[#0A0A0C] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>
      <button onClick={() => setBookmarked(!bookmarked)} className="text-[#4A4A44] hover:text-[#0A0A0C] transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? '#0A0A0C' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
      </button>
    </div>
  );
}

/* ── Article Detail View ────────────────────────────────────────── */
function ArticleDetail({ article, onBack, isSaved, onToggleSave }: { article: Article; onBack: () => void; isSaved: boolean; onToggleSave: () => void }) {
  return (
    <div className="min-h-screen bg-[#F7F6F1]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-[#F0EFE8] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onToggleSave} className="w-9 h-9 rounded-full bg-[#F0EFE8] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? '#0A0A0C' : 'none'} stroke="#0A0A0C" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            </button>
            <button className="w-9 h-9 rounded-full bg-[#F0EFE8] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="px-4 py-4 pb-24">
        <div className="flex items-center gap-2 mb-3">
          <LiveBadge urgency={article.urgency} />
          <span className="text-[10px] text-[#8A8A84] uppercase tracking-wider font-medium">{article.category}</span>
        </div>

        <h1 className="font-headline text-2xl sm:text-3xl font-black text-[#0A0A0C] leading-tight mb-4">
          {article.title}
        </h1>

        {/* Ownership attribution */}
        {article.owner ? (
          <OwnershipBadge owner={article.owner} timestamp={article.time} />
        ) : (
          <AuthorMeta />
        )}

        <p className="text-[15px] text-[#4A4A44] leading-relaxed mt-5">
          {article.excerpt}
        </p>

        {/* Embed card for Instagram content */}
        {article.embedUrl && (
          <div className="mt-5">
            <EmbedCard
              embedUrl={article.embedUrl}
              thumbnailUrl={article.image}
              mediaType={article.mediaType || 'image'}
              owner={article.owner!}
              engagement={article.engagement || { likes: 0, comments: 0 }}
              caption={article.excerpt}
            />
          </div>
        )}

        {/* Article body (editorial only) */}
        {!article.embedUrl && (
          <>
            <p className="text-[15px] text-[#4A4A44] leading-relaxed mt-4">
              The implications of this development extend far beyond immediate headlines. Analysts suggest this could reshape how citizens engage with governance and technology in the coming decade, marking a pivotal moment in the nation's digital transformation journey.
            </p>
            <p className="text-[15px] text-[#4A4A44] leading-relaxed mt-4">
              Stakeholders from various sectors have expressed optimism while also calling for careful implementation to ensure equitable access across all demographics. The government has pledged to establish oversight mechanisms to monitor progress and address concerns transparently.
            </p>

            {/* Inline image */}
            <div className="mt-6 rounded-2xl overflow-hidden">
              <img src={article.image} alt="" className="w-full h-48 sm:h-64 object-cover" />
              <p className="text-[10px] text-[#8A8A84] mt-2 text-center">Photo: Dhaka Heralds / File</p>
            </div>

            <p className="text-[15px] text-[#4A4A44] leading-relaxed mt-4">
              As the story continues to develop, Dhaka Heralds will provide real-time updates and expert analysis to keep you informed. Stay tuned for comprehensive coverage of this evolving situation.
            </p>
          </>
        )}
      </article>

      {/* Floating engagement bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-black/5">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-4">
          <button className="flex flex-col items-center gap-0.5 text-[#4A4A44]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
            <span className="text-[10px] font-medium">{article.engagement?.likes ?? 24}</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-[#4A4A44]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3"/></svg>
            <span className="text-[10px] font-medium">{article.engagement?.comments ?? 3}</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-[#4A4A44]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span className="text-[10px] font-medium">12</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-[#4A4A44]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Saved News Screen ──────────────────────────────────────────── */
function SavedScreen({ articles, onBack, onOpen }: { articles: Article[]; onBack: () => void; onOpen: (a: Article) => void }) {
  const [search, setSearch] = useState('');
  const filtered = search
    ? articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    : articles;

  return (
    <div className="min-h-screen bg-[#F7F6F1]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="flex items-center gap-3 px-4 h-12">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-[#F0EFE8] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="font-headline text-lg font-bold text-[#0A0A0C]">Saved News</h1>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A84]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search saved articles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-black/5 text-sm text-[#0A0A0C] placeholder:text-[#8A8A84] focus:outline-none focus:border-[#E8A820] transition-colors"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          />
        </div>
      </div>

      {/* Saved list */}
      <main className="px-4 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📰</div>
            <p className="text-sm text-[#8A8A84]">
              {search ? 'No saved articles match your search' : 'No saved articles yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(article => (
              <article
                key={article.id}
                onClick={() => onOpen(article)}
                className="flex gap-3 p-3 rounded-xl bg-white border border-black/5 cursor-pointer group"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#8A8A84] uppercase tracking-wider font-medium">{article.category}</span>
                  <h3 className="font-headline text-sm font-bold text-[#0A0A0C] leading-snug line-clamp-2 mt-0.5">
                    {article.title}
                  </h3>
                  <span className="text-[10px] text-[#8A8A84] mt-1 block">{article.time}</span>
                </div>
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <img src={article.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Nav Icon ───────────────────────────────────────────────────── */
function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? '#0A0A0C' : '#8A8A84';
  switch (name) {
    case 'home':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'search':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'bookmark':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
    case 'bell':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
    case 'user':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    default:
      return null;
  }
}
