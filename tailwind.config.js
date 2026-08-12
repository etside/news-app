/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          secondary: 'var(--gold-secondary)',
          glow: 'var(--gold-glow)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        glass: {
          bg: 'var(--glass-bg)',
          border: 'var(--glass-border)',
        },
        border: {
          DEFAULT: 'var(--border-line)',
          strong: 'var(--border-strong)',
        },
        breaking: 'var(--breaking)',
        high: 'var(--high)',
        high: 'var(--high)',
        urgent: {
          bg: 'var(--urgent-bg)',
          border: 'var(--urgent-border)',
        },
      },
      fontFamily: {
        headline: ['var(--font-headline)'],
        body: ['var(--font-body)'],
      },
      borderRadius: {
        card: '20px',
        pill: '100px',
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
    },
  },
  plugins: [],
}
