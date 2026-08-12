import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DhLogo from '../shared/DhLogo';
import PostManager from './PostManager';
import ArticleEditor from './ArticleEditor';
import UserManager from './UserManager';
import AnalyticsPanel from './AnalyticsPanel';

type AdminView = 'dashboard' | 'posts' | 'editor' | 'users' | 'analytics' | 'settings';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const { role, roleLabel, roleIcon, permissions } = useAuth();
  const [view, setView] = useState<AdminView>('dashboard');
  const [editingPostId, setEditingPostId] = useState<string | undefined>();

  // Reader gets a simplified dashboard
  if (role === 'reader') {
    return <ReaderDashboard onBack={onBack} />;
  }

  if (view === 'posts') {
    return (
      <PostManager
        onNewPost={() => { setEditingPostId(undefined); setView('editor'); }}
        onEdit={(id) => { setEditingPostId(id); setView('editor'); }}
        onBack={() => setView('dashboard')}
      />
    );
  }

  if (view === 'editor') {
    return (
      <ArticleEditor
        editId={editingPostId}
        onSave={() => setView('posts')}
        onCancel={() => setView('posts')}
      />
    );
  }

  if (view === 'users') {
    return <UserManager onBack={() => setView('dashboard')} />;
  }

  if (view === 'analytics') {
    return <AnalyticsPanel onBack={() => setView('dashboard')} />;
  }

  if (view === 'settings') {
    return <SettingsManager onBack={() => setView('dashboard')} />;
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <DhLogo size="sm" />
            <div>
              <h1 className="font-headline text-lg font-bold">{roleLabel} Panel</h1>
              <p className="text-xs text-text-muted">Dhaka Heralds Management</p>
            </div>
          </div>
          <div className="text-2xl">{roleIcon}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Quick Stats */}
        <QuickStats />

        {/* Role-specific actions */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {permissions.canPublish && (
              <ActionCard
                icon="✏️"
                title="New Article"
                desc="Write and publish"
                onClick={() => { setEditingPostId(undefined); setView('editor'); }}
              />
            )}
            {permissions.canPublish && (
              <ActionCard
                icon="📋"
                title="Manage Posts"
                desc="Edit, archive, publish"
                onClick={() => setView('posts')}
                badge={undefined}
              />
            )}
            {permissions.canManageUsers && (
              <ActionCard
                icon="👥"
                title="Users"
                desc="Roles & permissions"
                onClick={() => setView('users')}
              />
            )}
            {permissions.canViewAnalytics && (
              <ActionCard
                icon="📊"
                title="Analytics"
                desc="Traffic & engagement"
                onClick={() => setView('analytics')}
              />
            )}
            {permissions.canAccessSettings && (
              <ActionCard
                icon="⚙️"
                title="Settings"
                desc="Site configuration"
                onClick={() => setView('settings')}
              />
            )}
            {permissions.canManageLayout && (
              <ActionCard
                icon="🎨"
                title="Layouts"
                desc="Theme management"
                onClick={onBack}
              />
            )}
            {permissions.canManageCampaigns && (
              <ActionCard
                icon="📣"
                title="Campaigns"
                desc="Marketing & outreach"
                onClick={() => setView('analytics')}
              />
            )}
            {permissions.canExportData && (
              <ActionCard
                icon="📦"
                title="Export"
                desc="Download data"
                onClick={() => alert('Export feature — data will be downloaded as JSON')}
              />
            )}
          </div>
        </div>

        {/* Permissions Overview */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Your Permissions</h2>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(permissions).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs">
                  <span className={value ? 'text-green-500' : 'text-red-400'}>
                    {value ? '✓' : '✗'}
                  </span>
                  <span className="text-text-muted">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Recent Activity</h2>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

function QuickStats() {
  const [stats, setStats] = useState({ posts: 0, published: 0, users: 0 });

  useEffect(() => {
    try {
      const posts = JSON.parse(localStorage.getItem('dh-posts') || '[]');
      const users = JSON.parse(localStorage.getItem('dh-users') || '[]');
      setStats({
        posts: posts.length,
        published: posts.filter((p: any) => p.status === 'published').length,
        users: users.length || 4,
      });
    } catch {}
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="p-3 rounded-xl bg-surface border border-border text-center">
        <div className="text-2xl font-bold text-gold">{stats.posts}</div>
        <div className="text-xs text-text-muted">Articles</div>
      </div>
      <div className="p-3 rounded-xl bg-surface border border-border text-center">
        <div className="text-2xl font-bold text-green-500">{stats.published}</div>
        <div className="text-xs text-text-muted">Published</div>
      </div>
      <div className="p-3 rounded-xl bg-surface border border-border text-center">
        <div className="text-2xl font-bold text-blue-500">{stats.users}</div>
        <div className="text-xs text-text-muted">Users</div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, badge }: {
  icon: string; title: string; desc: string; onClick: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl bg-surface border border-border hover:border-gold/50 hover:bg-surface-2 transition-all text-left group"
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
        {badge && <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-gold text-black">{badge}</span>}
      </div>
      <h3 className="font-semibold text-sm mt-2">{title}</h3>
      <p className="text-xs text-text-muted mt-0.5">{desc}</p>
    </button>
  );
}

function RecentActivity() {
  const activities = [
    { text: 'Article published: "Bangladesh Parliament Approves Digital Governance Bill"', time: '2h ago', icon: '📰' },
    { text: 'New user registered: reader@example.com', time: '5h ago', icon: '👤' },
    { text: 'Layout changed to Cinematic theme', time: '1d ago', icon: '🎨' },
    { text: 'System backup completed', time: '2d ago', icon: '💾' },
  ];

  return (
    <div className="space-y-1.5">
      {activities.map((a, i) => (
        <div key={i} className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
          <span className="text-lg">{a.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-secondary truncate">{a.text}</p>
            <p className="text-xs text-text-muted">{a.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsManager({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="font-headline text-lg font-bold">Site Settings</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h3 className="font-semibold text-sm mb-2">Site Identity</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Site Name</label>
              <input type="text" defaultValue="Dhaka Heralds" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Tagline</label>
              <input type="text" defaultValue="Breaking news from Bangladesh" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Domain</label>
              <input type="text" defaultValue="dhakaheralds.hause.ink" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-gold transition-colors" readOnly />
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h3 className="font-semibold text-sm mb-2">Deployment</h3>
          <div className="space-y-2 text-xs text-text-muted">
            <div className="flex justify-between"><span>Platform</span><span className="text-text-secondary">GitHub Pages</span></div>
            <div className="flex justify-between"><span>Build</span><span className="text-text-secondary">Vite + React</span></div>
            <div className="flex justify-between"><span>Auto-deploy</span><span className="text-green-500">Enabled</span></div>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('dh-onboarding-v2');
            localStorage.removeItem('dh-prefs');
            localStorage.removeItem('dh-layout-preference');
            localStorage.removeItem('dh-user-role');
            localStorage.removeItem('dh-posts');
            localStorage.removeItem('dh-users');
            window.location.reload();
          }}
          className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}

function ReaderDashboard({ onBack }: { onBack: () => void }) {
  const { roleLabel, roleIcon } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <DhLogo size="sm" />
          <div>
            <h1 className="font-headline text-lg font-bold">{roleLabel}</h1>
            <p className="text-xs text-text-muted">Your reading dashboard</p>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div className="text-center py-8">
          <div className="text-5xl mb-3">{roleIcon}</div>
          <h2 className="font-headline text-xl font-bold mb-1">Welcome, Reader</h2>
          <p className="text-sm text-text-muted">Browse the latest news from Dhaka Heralds</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onBack} className="p-4 rounded-xl bg-surface border border-border hover:border-gold/50 transition-all text-left">
            <span className="text-2xl">📰</span>
            <h3 className="font-semibold text-sm mt-2">Browse News</h3>
            <p className="text-xs text-text-muted">Read latest articles</p>
          </button>
          <button onClick={onBack} className="p-4 rounded-xl bg-surface border border-border hover:border-gold/50 transition-all text-left">
            <span className="text-2xl">🔖</span>
            <h3 className="font-semibold text-sm mt-2">Saved Articles</h3>
            <p className="text-xs text-text-muted">Your reading list</p>
          </button>
        </div>
      </div>
    </div>
  );
}
