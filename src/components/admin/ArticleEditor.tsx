import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export interface PostArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  urgency: 'breaking' | 'high' | 'normal' | 'low';
  status: 'draft' | 'pending' | 'published' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
}

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

const CATEGORIES = ['Politics', 'Economy', 'Technology', 'Sports', 'Culture', 'Environment', 'Health', 'Education', 'Business', 'Digital'];

const URGENCY_OPTIONS = [
  { value: 'breaking', label: 'Breaking', color: 'text-red-500 bg-red-500/10' },
  { value: 'high', label: 'High', color: 'text-orange-500 bg-orange-500/10' },
  { value: 'normal', label: 'Normal', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'low', label: 'Low', color: 'text-text-muted bg-surface-3' },
] as const;

interface ArticleEditorProps {
  onSave: () => void;
  onCancel: () => void;
  editId?: string;
}

export default function ArticleEditor({ onSave, onCancel, editId }: ArticleEditorProps) {
  const { role, roleLabel } = useAuth();
  const posts = loadPosts();
  const existing = editId ? posts.find(p => p.id === editId) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [excerpt, setExcerpt] = useState(existing?.excerpt || '');
  const [content, setContent] = useState(existing?.content || '');
  const [category, setCategory] = useState(existing?.category || 'Politics');
  const [image, setImage] = useState(existing?.image || '');
  const [urgency, setUrgency] = useState<PostArticle['urgency']>(existing?.urgency || 'normal');
  const [showPreview, setShowPreview] = useState(false);

  const canPublish = role === 'admin' || role === 'editor';
  const canDraft = role === 'admin' || role === 'editor' || role === 'marketer';

  const handleSave = (status: PostArticle['status']) => {
    const now = new Date().toISOString();
    const article: PostArticle = {
      id: editId || `post-${Date.now()}`,
      title,
      excerpt,
      content,
      category,
      image: image || `https://picsum.photos/seed/${Date.now()}/600/400`,
      urgency,
      status,
      author: roleLabel,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    const all = loadPosts();
    const idx = all.findIndex(p => p.id === article.id);
    if (idx >= 0) all[idx] = article;
    else all.unshift(article);
    savePosts(all);
    onSave();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="font-headline text-lg font-bold">{editId ? 'Edit Article' : 'New Article'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-2 border border-border hover:border-border-strong transition-colors"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            {canDraft && (
              <button
                onClick={() => handleSave('draft')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-2 border border-border hover:border-border-strong transition-colors"
              >
                Save Draft
              </button>
            )}
            {canPublish && (
              <button
                onClick={() => handleSave('published')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gold text-black hover:bg-gold/90 transition-colors"
              >
                Publish
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {showPreview ? (
          /* Preview Mode */
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-border">
              {image && <img src={image} alt={title} className="w-full h-64 object-cover" />}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold">{category}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${URGENCY_OPTIONS.find(u => u.value === urgency)?.color}`}>
                    {URGENCY_OPTIONS.find(u => u.value === urgency)?.label}
                  </span>
                </div>
                <h2 className="font-headline text-2xl font-bold mb-2">{title || 'Untitled'}</h2>
                <p className="text-text-muted text-sm mb-4">{excerpt || 'No excerpt'}</p>
                <div className="prose prose-invert max-w-none text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                  {content || 'No content'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-5">
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Article headline..."
              className="w-full text-2xl font-headline font-bold bg-transparent border-none outline-none placeholder:text-text-muted"
            />

            {/* Excerpt */}
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Brief summary for the feed..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-sm resize-none focus:outline-none focus:border-gold transition-colors placeholder:text-text-muted"
            />

            {/* Content */}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your article here... (supports plain text)"
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-sm resize-y focus:outline-none focus:border-gold transition-colors placeholder:text-text-muted"
            />

            {/* Image URL */}
            <div>
              <label className="text-xs text-text-muted mb-1 block">Cover Image URL</label>
              <input
                type="url"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg (or leave blank for auto)"
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-text-muted"
              />
            </div>

            {/* Category & Urgency Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-gold transition-colors"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Priority</label>
                <div className="flex gap-1.5">
                  {URGENCY_OPTIONS.map(u => (
                    <button
                      key={u.value}
                      onClick={() => setUrgency(u.value)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        urgency === u.value
                          ? `${u.color} border-current`
                          : 'bg-surface-2 border-border text-text-muted hover:border-border-strong'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-2 text-xs text-text-muted">
              <span>Posting as</span>
              <span className="font-medium text-text-secondary">{roleLabel}</span>
              <span className="ml-auto text-text-muted">
                {status === 'draft' ? 'Draft' : 'Ready to publish'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
