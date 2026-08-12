import { useState, useEffect } from 'react';
import { useLayout, LAYOUT_OPTIONS, type LayoutId } from '../contexts/LayoutContext';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

interface UserPrefs {
  age: string;
  personalization: boolean;
  contact: string;
  contactType: 'email' | 'phone';
  verification: boolean;
  layout: LayoutId;
}

const PREFS_KEY = 'dh-prefs';

function loadPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { age: '', personalization: false, contact: '', contactType: 'email', verification: true, layout: 'default' };
}

function savePrefs(p: UserPrefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {}
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { layout, setLayout } = useLayout();
  const [prefs, setPrefs] = useState<UserPrefs>(loadPrefs);

  useEffect(() => {
    if (open) setPrefs(loadPrefs());
  }, [open]);

  const update = (partial: Partial<UserPrefs>) => {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    savePrefs(next);
    if (partial.layout) setLayout(partial.layout);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto bg-surface border-t sm:border sm:rounded-2xl border-border section-enter">
        <div className="p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl font-bold">Settings</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Layout Theme */}
          <Section title="Layout Theme">
            <div className="space-y-2">
              {LAYOUT_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => update({ layout: option.id })}
                  className={`w-full p-3 rounded-xl text-left transition-all border ${
                    layout === option.id
                      ? 'border-gold bg-surface-2'
                      : 'border-border bg-surface hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{option.preview}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{option.name}</h4>
                      <p className="text-text-muted text-xs">{option.description}</p>
                    </div>
                    {layout === option.id && (
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* Personalization */}
          <Section title="Daily Personalized News">
            <Toggle
              label="Personalized daily briefing"
              desc="Get news tailored to your interests"
              value={prefs.personalization}
              onChange={v => update({ personalization: v })}
            />
            {prefs.personalization && (
              <div className="mt-3">
                <label className="text-xs text-text-muted mb-1 block">{prefs.contactType === 'email' ? 'Email' : 'Phone'}</label>
                <input
                  type={prefs.contactType === 'email' ? 'email' : 'tel'}
                  value={prefs.contact}
                  onChange={e => update({ contact: e.target.value })}
                  placeholder={prefs.contactType === 'email' ? 'you@example.com' : '+880 1XXXXXXXXX'}
                  className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            )}
          </Section>

          {/* Verification */}
          <Section title="News Verification">
            <Toggle
              label="Fact-checking & verification"
              desc="Show verified badges, cross-reference alerts, and bias detection"
              value={prefs.verification}
              onChange={v => update({ verification: v })}
            />
          </Section>

          {/* Reset */}
          <div className="pt-4 border-t border-border">
            <button
              onClick={() => {
                localStorage.removeItem(PREFS_KEY);
                localStorage.removeItem('dh-onboarding-done');
                localStorage.removeItem('dh-layout-preference');
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              Reset Onboarding & Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border hover:border-border-strong transition-colors"
    >
      <div className="text-left">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-text-muted">{desc}</div>
      </div>
      <div className={`w-10 h-6 rounded-full transition-colors relative ${value ? 'bg-gold' : 'bg-surface-3'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
    </button>
  );
}
