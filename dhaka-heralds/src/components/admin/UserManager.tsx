import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const USERS_KEY = 'dh-users';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'marketer' | 'reader';
  joined: string;
  active: boolean;
}

function loadUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: '1', name: 'Admin User', email: 'admin@dhakaheralds.com', role: 'admin', joined: '2026-01-15', active: true },
    { id: '2', name: 'News Editor', email: 'editor@dhakaheralds.com', role: 'editor', joined: '2026-02-20', active: true },
    { id: '3', name: 'Marketing Lead', email: 'marketing@dhakaheralds.com', role: 'marketer', joined: '2026-03-10', active: true },
    { id: '4', name: 'Regular Reader', email: 'reader@example.com', role: 'reader', joined: '2026-04-05', active: true },
  ];
}

function saveUsers(users: ManagedUser[]) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-500',
  editor: 'bg-blue-500/10 text-blue-500',
  marketer: 'bg-green-500/10 text-green-500',
  reader: 'bg-surface-3 text-text-muted',
};

interface UserManagerProps {
  onBack: () => void;
}

export default function UserManager({ onBack }: UserManagerProps) {
  const { role: currentRole } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>(loadUsers);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<ManagedUser['role']>('reader');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newName || !newEmail) return;
    const user: ManagedUser = {
      id: `user-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      joined: new Date().toISOString().split('T')[0],
      active: true,
    };
    const next = [...users, user];
    saveUsers(next);
    setUsers(next);
    setNewName('');
    setNewEmail('');
    setNewRole('reader');
    setShowAdd(false);
  };

  const handleRoleChange = (id: string, newRole: ManagedUser['role']) => {
    const next = users.map(u => u.id === id ? { ...u, role: newRole } : u);
    saveUsers(next);
    setUsers(next);
  };

  const handleToggleActive = (id: string) => {
    const next = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    saveUsers(next);
    setUsers(next);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this user?')) return;
    const next = users.filter(u => u.id !== id);
    saveUsers(next);
    setUsers(next);
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    admins: users.filter(u => u.role === 'admin').length,
    editors: users.filter(u => u.role === 'editor').length,
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
            <h1 className="font-headline text-lg font-bold">Users</h1>
          </div>
          {currentRole === 'admin' && (
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gold text-black hover:bg-gold/90 transition-colors"
            >
              + Add User
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-surface border border-border text-center">
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-text-muted">Total</div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface border border-border text-center">
            <div className="text-lg font-bold text-green-500">{stats.active}</div>
            <div className="text-xs text-text-muted">Active</div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface border border-border text-center">
            <div className="text-lg font-bold text-red-500">{stats.admins}</div>
            <div className="text-xs text-text-muted">Admins</div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface border border-border text-center">
            <div className="text-lg font-bold text-blue-500">{stats.editors}</div>
            <div className="text-xs text-text-muted">Editors</div>
          </div>
        </div>

        {/* Add User Form */}
        {showAdd && (
          <div className="p-4 rounded-xl bg-surface border border-border mb-4 space-y-3">
            <h3 className="text-sm font-semibold">Add New User</h3>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-gold transition-colors"
            />
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-gold transition-colors"
            />
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as ManagedUser['role'])}
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-gold transition-colors"
            >
              <option value="reader">Reader</option>
              <option value="editor">Editor</option>
              <option value="marketer">Marketer</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleAddUser} className="flex-1 py-2 rounded-lg bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors">Add User</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg bg-surface-2 text-sm hover:bg-surface-3 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm mb-4 focus:outline-none focus:border-gold transition-colors placeholder:text-text-muted"
        />

        {/* User List */}
        <div className="space-y-2">
          {filtered.map(user => (
            <div key={user.id} className="p-3 rounded-xl bg-surface border border-border hover:border-border-strong transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-lg font-bold text-text-secondary flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{user.name}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ROLE_STYLES[user.role]}`}>
                      {user.role}
                    </span>
                    {!user.active && <span className="text-xs text-red-400">Inactive</span>}
                  </div>
                  <p className="text-xs text-text-muted">{user.email} · Joined {user.joined}</p>
                </div>
                {currentRole === 'admin' && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value as ManagedUser['role'])}
                      className="px-2 py-1 rounded-lg bg-surface-2 border border-border text-xs focus:outline-none focus:border-gold"
                    >
                      <option value="reader">Reader</option>
                      <option value="editor">Editor</option>
                      <option value="marketer">Marketer</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        user.active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-surface-2 text-text-muted hover:bg-surface-3'
                      }`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {user.active
                          ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                          : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        }
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors text-red-500"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
