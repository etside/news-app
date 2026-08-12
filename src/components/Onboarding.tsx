import { useState } from 'react';
import { useLayout, LAYOUT_OPTIONS, type LayoutId } from '../contexts/LayoutContext';
import { useAuth, type UserRole, ROLE_LABELS, ROLE_ICONS, ROLE_DESCRIPTIONS } from '../contexts/AuthContext';

interface OnboardingProps {
  onDone: () => void;
}

type Step = 'welcome' | 'role' | 'age' | 'personalize' | 'contact' | 'verify' | 'gestures' | 'layout';

const AGE_GROUPS = [
  { id: 'under-18', label: 'Under 18', icon: '📚' },
  { id: '18-24', label: '18–24', icon: '🎓' },
  { id: '25-34', label: '25–34', icon: '💼' },
  { id: '35-44', label: '35–44', icon: '📊' },
  { id: '45-54', label: '45–54', icon: '📰' },
  { id: '55-plus', label: '55+', icon: '🏛️' },
];

const FACT_CHECK_FEATURES = [
  { title: 'Source Verification', desc: 'Every article links to primary sources so you can verify claims yourself.', icon: '🔗' },
  { title: 'Cross-Reference Alerts', desc: 'When a story is reported differently across outlets, we flag it and show you all perspectives.', icon: '⚖️' },
  { title: 'Propaganda Detection', desc: 'AI-powered analysis identifies emotionally charged language and potential bias in headlines.', icon: '🛡️' },
  { title: 'Verified Badge', desc: 'Articles that pass our multi-step fact-check earn a verified badge you can trust.', icon: '✅' },
];

const GESTURE_GUIDE = [
  { gesture: 'Swipe Left', action: 'Next section', icon: '👈', desc: 'Move to the next news section (Analysis, Opinion, World, Tech)' },
  { gesture: 'Swipe Right', action: 'Previous section', icon: '👉', desc: 'Go back to the previous news section' },
  { gesture: 'Tap Article', action: 'Read full story', icon: '👆', desc: 'Open the article in full-screen reading mode' },
  { gesture: 'Swipe Down', action: 'Refresh feed', icon: '👇', desc: 'Pull down to refresh the latest headlines' },
  { gesture: 'Long Press', action: 'Save article', icon: '✊', desc: 'Long press on any article card to save it for later' },
  { gesture: 'Pinch', action: 'Zoom content', icon: '🤏', desc: 'Pinch to zoom in/out on article images and cards' },
];

const AVAILABLE_ROLES: UserRole[] = ['reader', 'editor', 'marketer', 'admin'];

export default function Onboarding({ onDone }: OnboardingProps) {
  const { setLayout } = useLayout();
  const { setRole } = useAuth();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedRole, setSelectedRole] = useState<UserRole>('reader');
  const [age, setAge] = useState('');
  const [wantsPersonalization, setWantsPersonalization] = useState<boolean | null>(null);
  const [contact, setContact] = useState('');
  const [wantsVerification, setWantsVerification] = useState<boolean | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutId>('default');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [gesturesSeen, setGesturesSeen] = useState(false);

  const progress = {
    welcome: 0,
    role: 12,
    age: 24,
    personalize: 36,
    contact: 48,
    verify: 60,
    gestures: 72,
    layout: 88,
  }[step];

  const next = (s: Step) => setStep(s);

  const finish = () => {
    setLayout(selectedLayout);
    setRole(selectedRole);
    try {
      localStorage.setItem('dh-prefs', JSON.stringify({
        role: selectedRole,
        age,
        personalization: wantsPersonalization,
        contact: wantsPersonalization ? contact : null,
        contactType: wantsPersonalization ? contactType : null,
        verification: wantsVerification,
        gesturesSeen,
        layout: selectedLayout,
      }));
    } catch {}
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-lg w-full my-8">
        {/* Progress bar */}
        <div className="w-full h-1 bg-surface-2 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--gold), var(--gold-secondary))',
            }}
          />
        </div>

        {/* Step content */}
        <div className="section-enter" key={step}>
          {step === 'welcome' && <WelcomeStep onNext={() => next('role')} />}
          {step === 'role' && <RoleStep selected={selectedRole} setSelected={setSelectedRole} onNext={() => next('age')} onBack={() => next('welcome')} />}
          {step === 'age' && <AgeStep age={age} setAge={setAge} onNext={() => next('personalize')} onBack={() => next('role')} />}
          {step === 'personalize' && <PersonalizeStep choice={wantsPersonalization} setChoice={setWantsPersonalization} onNext={() => next(wantsPersonalization ? 'contact' : 'verify')} onBack={() => next('age')} />}
          {step === 'contact' && <ContactStep contact={contact} setContact={setContact} contactType={contactType} setContactType={setContactType} onNext={() => next('verify')} onBack={() => next('personalize')} />}
          {step === 'verify' && <VerifyStep choice={wantsVerification} setChoice={setWantsVerification} onNext={() => next('gestures')} onBack={() => next(wantsPersonalization ? 'contact' : 'personalize')} />}
          {step === 'gestures' && <GestureStep seen={gesturesSeen} setSeen={setGesturesSeen} onNext={() => next('layout')} onBack={() => next('verify')} />}
          {step === 'layout' && <LayoutStep selected={selectedLayout} setSelected={setSelectedLayout} onNext={finish} onBack={() => next('gestures')} />}
        </div>
      </div>
    </div>
  );
}

/* ── Step 1: Welcome ─────────────────────────────────────────────── */
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-5 rounded-xl overflow-hidden" style={{ boxShadow: '0 0 32px rgba(232,168,32,0.2)' }}>
        <img
          src={`${import.meta.env.BASE_URL}logo.webp`}
          alt="Dhaka Heralds"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="font-headline text-3xl font-bold mb-3">Welcome to Dhaka Heralds</h1>
      <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-md mx-auto">
        Your trusted source for verified news and in-depth analysis from Bangladesh and beyond. We believe in truth, transparency, and informed citizens.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
        {[
          { icon: '📰', title: 'Curated News', desc: 'Handpicked stories from reliable sources, organized by urgency and relevance.' },
          { icon: '🔍', title: 'Fact-Checked', desc: 'Every article cross-referenced for accuracy. No fake news, no propaganda.' },
          { icon: '🎯', title: 'Personalized', desc: 'News tailored to your interests, delivered at your preferred frequency.' },
        ].map(f => (
          <div key={f.title} className="p-4 rounded-xl bg-surface border border-border">
            <div className="text-2xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
            <p className="text-text-muted text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="px-8 py-3 bg-gold text-black font-semibold rounded-full hover:bg-gold-secondary transition-colors"
        style={{ boxShadow: '0 0 20px rgba(232,168,32,0.3)' }}
      >
        Let's Get Started
      </button>
    </div>
  );
}

/* ── Step 2: Role Selection ──────────────────────────────────────── */
function RoleStep({ selected, setSelected, onNext, onBack }: { selected: UserRole; setSelected: (r: UserRole) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="text-center">
      <h2 className="font-headline text-2xl font-bold mb-2">Your Role</h2>
      <p className="text-text-secondary text-sm mb-6">Select your access level to customize the features you can use.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {AVAILABLE_ROLES.map(role => (
          <button
            key={role}
            onClick={() => setSelected(role)}
            className={`p-4 rounded-xl text-left transition-all border-2 ${
              selected === role
                ? 'border-gold bg-surface-2'
                : 'border-border bg-surface hover:border-border-strong'
            }`}
          >
            <div className="text-2xl mb-2">{ROLE_ICONS[role]}</div>
            <h3 className="font-semibold text-sm mb-1">{ROLE_LABELS[role]}</h3>
            <p className="text-text-muted text-xs leading-relaxed">{ROLE_DESCRIPTIONS[role]}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-2.5 bg-gold text-black font-semibold rounded-full transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Age ─────────────────────────────────────────────────── */
function AgeStep({ age, setAge, onNext, onBack }: { age: string; setAge: (a: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="text-center">
      <h2 className="font-headline text-2xl font-bold mb-2">Your Age Group</h2>
      <p className="text-text-secondary text-sm mb-6">This helps us tailor content complexity and topics to your reading level.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {AGE_GROUPS.map(g => (
          <button
            key={g.id}
            onClick={() => setAge(g.id)}
            className={`p-4 rounded-xl text-left transition-all border-2 ${
              age === g.id
                ? 'border-gold bg-surface-2'
                : 'border-border bg-surface hover:border-border-strong'
            }`}
          >
            <div className="text-2xl mb-1">{g.icon}</div>
            <div className="font-semibold text-sm">{g.label}</div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!age}
          className="px-8 py-2.5 bg-gold text-black font-semibold rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ── Step 4: Personalization ─────────────────────────────────────── */
function PersonalizeStep({ choice, setChoice, onNext, onBack }: { choice: boolean | null; setChoice: (c: boolean) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="text-center">
      <h2 className="font-headline text-2xl font-bold mb-2">Daily Personalized News</h2>
      <p className="text-text-secondary text-sm mb-6">
        Would you like Dhaka Heralds to send you a personalized daily briefing based on your interests?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
        <button
          onClick={() => setChoice(true)}
          className={`p-5 rounded-xl text-left transition-all border-2 ${
            choice === true
              ? 'border-gold bg-surface-2'
              : 'border-border bg-surface hover:border-border-strong'
          }`}
        >
          <div className="text-2xl mb-2">📬</div>
          <h3 className="font-semibold text-sm mb-1">Yes, personalize my news</h3>
          <p className="text-text-muted text-xs leading-relaxed">Get a custom daily briefing tailored to your interests and reading level.</p>
        </button>

        <button
          onClick={() => setChoice(false)}
          className={`p-5 rounded-xl text-left transition-all border-2 ${
            choice === false
              ? 'border-gold bg-surface-2'
              : 'border-border bg-surface hover:border-border-strong'
          }`}
        >
          <div className="text-2xl mb-2">📰</div>
          <h3 className="font-semibold text-sm mb-1">No, show all news</h3>
          <p className="text-text-muted text-xs leading-relaxed">Browse the full feed without personalization. You can always change this later.</p>
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={choice === null}
          className="px-8 py-2.5 bg-gold text-black font-semibold rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ── Step 5: Contact ─────────────────────────────────────────────── */
function ContactStep({ contact, setContact, contactType, setContactType, onNext, onBack }: {
  contact: string; setContact: (c: string) => void;
  contactType: 'email' | 'phone'; setContactType: (t: 'email' | 'phone') => void;
  onNext: () => void; onBack: () => void;
}) {
  const isValid = contactType === 'email'
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    : /^\+?[\d\s-]{7,15}$/.test(contact);

  return (
    <div className="text-center">
      <h2 className="font-headline text-2xl font-bold mb-2">Stay Connected</h2>
      <p className="text-text-secondary text-sm mb-6">
        Where should we send your personalized daily briefing?
      </p>

      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => setContactType('email')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            contactType === 'email' ? 'bg-gold text-black' : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setContactType('phone')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            contactType === 'phone' ? 'bg-gold text-black' : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
          }`}
        >
          Phone (SMS)
        </button>
      </div>

      <div className="max-w-sm mx-auto mb-4">
        <input
          type={contactType === 'email' ? 'email' : 'tel'}
          value={contact}
          onChange={e => setContact(e.target.value)}
          placeholder={contactType === 'email' ? 'you@example.com' : '+880 1XXXXXXXXX'}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <p className="text-text-muted text-xs mb-8">We respect your privacy. Unsubscribe anytime.</p>

      <div className="flex items-center justify-center gap-3">
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-8 py-2.5 bg-gold text-black font-semibold rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ── Step 6: Fact-Checking / Verification ────────────────────────── */
function VerifyStep({ choice, setChoice, onNext, onBack }: { choice: boolean | null; setChoice: (c: boolean) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="text-center">
      <h2 className="font-headline text-2xl font-bold mb-2">News Verification</h2>
      <p className="text-text-secondary text-sm mb-6">
        In an era of misinformation, every story should be verified. Dhaka Heralds ensures no fake news or political propaganda reaches you unchallenged.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
        {FACT_CHECK_FEATURES.map(f => (
          <div key={f.title} className="p-4 rounded-xl bg-surface border border-border">
            <div className="text-xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
            <p className="text-text-muted text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
        <button
          onClick={() => setChoice(true)}
          className={`p-4 rounded-xl text-left transition-all border-2 ${
            choice === true
              ? 'border-gold bg-surface-2'
              : 'border-border bg-surface hover:border-border-strong'
          }`}
        >
          <div className="text-lg mb-1">🛡️</div>
          <h3 className="font-semibold text-sm">Enable verification</h3>
          <p className="text-text-muted text-xs mt-1">Show verified badges, cross-reference alerts, and bias detection on all articles.</p>
        </button>

        <button
          onClick={() => setChoice(false)}
          className={`p-4 rounded-xl text-left transition-all border-2 ${
            choice === false
              ? 'border-gold bg-surface-2'
              : 'border-border bg-surface hover:border-border-strong'
          }`}
        >
          <div className="text-lg mb-1">📄</div>
          <h3 className="font-semibold text-sm">Standard mode</h3>
          <p className="text-text-muted text-xs mt-1">Read articles without verification overlays. You can enable this anytime in Settings.</p>
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={choice === null}
          className="px-8 py-2.5 bg-gold text-black font-semibold rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ── Step 7: Gesture Education ───────────────────────────────────── */
function GestureStep({ seen, setSeen, onNext, onBack }: { seen: boolean; setSeen: (v: boolean) => void; onNext: () => void; onBack: () => void }) {
  const [demoActive, setDemoActive] = useState<number | null>(null);

  return (
    <div className="text-center">
      <h2 className="font-headline text-2xl font-bold mb-2">Gesture Navigation</h2>
      <p className="text-text-secondary text-sm mb-6">
        Navigate Dhaka Heralds with intuitive touch gestures. Try each one to see it in action.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
        {GESTURE_GUIDE.map((g, i) => (
          <button
            key={g.gesture}
            onClick={() => {
              setDemoActive(i);
              setTimeout(() => setDemoActive(null), 1500);
              setSeen(true);
            }}
            className={`p-4 rounded-xl transition-all border-2 ${
              demoActive === i
                ? 'border-gold bg-gold/10 scale-[1.02]'
                : 'border-border bg-surface hover:border-border-strong'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`text-2xl transition-transform ${demoActive === i ? 'animate-bounce' : ''}`}>
                {g.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-sm">{g.gesture}</h3>
                <p className="text-gold text-xs font-medium">{g.action}</p>
                <p className="text-text-muted text-xs leading-relaxed mt-1">{g.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Demo area */}
      <div className="relative h-16 rounded-xl bg-surface-2 border border-border mb-6 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {demoActive !== null ? (
            <div className="flex items-center gap-2 text-gold font-medium text-sm animate-pulse">
              <span>{GESTURE_GUIDE[demoActive].icon}</span>
              <span>{GESTURE_GUIDE[demoActive].gesture} → {GESTURE_GUIDE[demoActive].action}</span>
            </div>
          ) : (
            <span className="text-text-muted text-sm">Tap a gesture above to see it in action</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-2.5 bg-gold text-black font-semibold rounded-full transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ── Step 8: Layout Selection ────────────────────────────────────── */
function LayoutStep({ selected, setSelected, onNext, onBack }: { selected: LayoutId; setSelected: (l: LayoutId) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="text-center">
      <h2 className="font-headline text-2xl font-bold mb-2">Choose Your Layout</h2>
      <p className="text-text-secondary text-sm mb-6">Pick the reading experience that suits you best.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {LAYOUT_OPTIONS.map(option => (
          <button
            key={option.id}
            onClick={() => setSelected(option.id)}
            className={`relative p-4 rounded-xl text-left transition-all border-2 ${
              selected === option.id
                ? 'border-gold bg-surface-2'
                : 'border-border bg-surface hover:border-border-strong'
            }`}
          >
            <div className="text-2xl mb-2">{option.preview}</div>
            <h3 className="font-headline text-sm font-bold mb-1">{option.name}</h3>
            <p className="text-text-secondary text-xs leading-relaxed">{option.description}</p>
            {selected === option.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={onBack} className="px-5 py-2.5 rounded-full border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gold text-black font-semibold rounded-full hover:bg-gold-secondary transition-colors"
          style={{ boxShadow: '0 0 20px rgba(232,168,32,0.3)' }}
        >
          Start Reading
        </button>
      </div>
    </div>
  );
}
