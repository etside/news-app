import { useLayout, LAYOUT_OPTIONS, type LayoutId } from '../contexts/LayoutContext';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { layout, setLayout } = useLayout();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-surface border-t sm:border sm:rounded-2xl border-border overflow-hidden section-enter">
        <div className="p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl font-bold">Settings</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Layout Theme</h3>
            <div className="space-y-2">
              {LAYOUT_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => setLayout(option.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    layout === option.id
                      ? 'border-gold bg-surface-2'
                      : 'border-border bg-surface hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.preview}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
