import { useState } from 'react';
import { useLayout, LAYOUT_OPTIONS, type LayoutId } from '../contexts/LayoutContext';

interface OnboardingProps {
  onDone: () => void;
}

export default function Onboarding({ onDone }: OnboardingProps) {
  const { setLayout } = useLayout();
  const [selected, setSelected] = useState<LayoutId>('default');

  const handleConfirm = () => {
    setLayout(selected);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-white mx-auto mb-4 flex items-center justify-center" style={{ boxShadow: '0 0 24px rgba(255,255,255,0.15)' }}>
            <span className="font-headline font-bold text-[#0A0A0C] text-lg">DH</span>
          </div>
          <h1 className="font-headline text-3xl font-bold mb-2">Welcome to Dhaka Heralds</h1>
          <p className="text-text-secondary text-sm">Choose your preferred reading experience</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {LAYOUT_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`relative p-5 rounded-2xl text-left transition-all duration-300 border-2 ${
                selected === option.id
                  ? 'border-gold bg-surface-2 shadow-lg'
                  : 'border-border bg-surface hover:border-border-strong'
              }`}
              style={selected === option.id ? { boxShadow: '0 0 24px rgba(232,168,32,0.2)' } : undefined}
            >
              <div className="text-3xl mb-3">{option.preview}</div>
              <h3 className="font-headline text-base font-bold mb-1">{option.name}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{option.description}</p>
              {selected === option.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleConfirm}
            className="px-8 py-3 bg-gold text-black font-semibold rounded-full hover:bg-gold-secondary transition-colors"
            style={{ boxShadow: '0 0 20px rgba(232,168,32,0.3)' }}
          >
            Get Started
          </button>
          <p className="text-text-muted text-xs mt-3">You can change this anytime in Settings</p>
        </div>
      </div>
    </div>
  );
}
