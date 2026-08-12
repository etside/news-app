import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { PostArticle } from './ArticleEditor';

const POSTS_KEY = 'dh-posts';

function loadPosts(): PostArticle[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function savePosts(posts: PostArticle[]) {
  try { localStorage.setItem(POSTS_KEY, JSON.stringify(posts)); } catch {}
}

interface PostManagerProps {
  onEdit: (id: string) => void;
  onNewPost: () => void;
  onBack: () => void;
}

export default function PostManager({ onEdit, onNewPost, onBack }: PostManagerProps) {
  const { role, roleLabel } = useAuth();
  const [posts, setPosts] = useState<PostArticle[]>(loadPosts);
  const [filter, setFilter] = useState<'all' | PostArticle['status']>('all');
  const [search, setSearch] = useState('');

  const filtered = posts.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    if (!confirm('Delete this article?')) return;
    const next = posts.filter(p => p.id !== id);
    savePosts(next);
    setPosts(next);
  };

  const handleStatusChange = (id: string, status: PostArticle['status']) => {
    const next = posts.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p);
    savePosts(next);
    setPosts(next);
  };

  const canPublish = role === 'admin' || role === 'editor';
  const canDelete = role === 'admin';
  const canModerate = role === 'admin' || role === 'editor';

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    pending: posts.filter(p => p.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="font-headline text-lg font-bold">Posts</h1>
            <span className="text-xs text-text-muted">{stats.total} total</span>
          </div>
          {canPublish && (
            <button
              onClick={onNewPost}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gold text-black hover:bg-gold/90 transition-colors"
            >
              + New Post
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-text-primary' },
            { label: 'Published', value: stats.published, color: 'text-green-500' },
            { label: 'Drafts', value: stats.drafts, color: 'text-yellow-500' },
            { label: 'Pending', value: stats.pending, color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="p-2.5 rounded-xl bg-surface border border-border text-center">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm mb-3 focus:outline-none focus:border-gold transition-colors placeholder:text-text-muted"
        />

        {/* Filter Tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto">
          {(['all', 'published', 'draft', 'pending', 'archived'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-gold text-black'
                  : 'bg-surface-2 text-text-muted hover:text-text-secondary border border-border'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Post List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-text-muted text-sm">
              {posts.length === 0 ? 'No articles yet. Create your first post!' : 'No posts match your filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(post => (
              <div
                key={post.id}
                className="p-3 rounded-xl bg-surface border border-border hover:border-border-strong transition-all"
              >
                <div className="flex items-start gap-3">
                  {post.image && (
                    <img src={post.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gold/10 text-gold">{post.category}</span>
                      <StatusBadge status={post.status} />
                    </div>
                    <h3 className="font-semibold text-sm truncate">{post.title || 'Untitled'}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{post.author} · {new Date(post.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEdit(post.id)}
                      className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    {canModerate && post.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(post.id, 'published')}
                        className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center hover:bg-green-500/20 transition-colors text-green-500"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                    )}
                    {canModerate && post.status === 'published' && (
                      <button
                        onClick={() => handleStatusChange(post.id, 'archived')}
                        className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors text-text-muted"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors text-red-500"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PostArticle['status'] }) {
  const styles: Record<string, string> = {
    published: 'bg-green-500/10 text-green-500',
    draft: 'bg-yellow-500/10 text-yellow-500',
    pending: 'bg-blue-500/10 text-blue-500',
    archived: 'bg-surface-3 text-text-muted',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${styles[status] || ''}`}>
      {status}
    </span>
  );
}
