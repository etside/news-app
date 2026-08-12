# Dhaka Heralds

Breaking news and in-depth reporting from Bangladesh. An Apple News-inspired web application built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **5 Layout Variants**: Default, high-contrast, topics, cinematic, and gesture-based navigation
- **Role-Based Auth**: Admin, editor, marketer, and reader roles
- **Admin Panel**: Article management, post scheduling, user management, analytics
- **Instagram Embeds**: Embedded Instagram posts with ownership attribution
- **Theme Support**: Dark/light mode with system preference detection
- **Splash Screen & Onboarding**: First-run experience for new users

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS v3
- Framer Motion for animations
- React Router v7
- esbuild (build pipeline)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deployment

### Netlify (Recommended)

1. Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or use the Netlify CLI:
   ```bash
   netlify deploy --dir=dist --prod
   ```

The `netlify.toml` is pre-configured with SPA redirects.

### GitHub Actions

The workflow automatically builds and uploads a Netlify-ready zip as a GitHub Actions artifact on every push to `main`.

1. Go to Actions > Build Dhaka Heralds
2. Download the `dhaka-heralds-netlify` artifact
3. Upload to Netlify

## Project Structure

```
dhaka-heralds/
├── src/
│   ├── components/      # UI components
│   │   ├── layouts/     # 5 layout variants
│   │   ├── shared/      # Reusable components
│   │   └── admin/       # Admin panel
│   ├── contexts/        # React contexts (Auth, Layout)
│   ├── data/            # Articles and Instagram posts
│   └── lib/             # Utilities and theme
├── public/              # Static assets
├── build.mjs            # esbuild build script
├── netlify.toml         # Netlify configuration
└── tailwind.config.js   # Tailwind CSS config
```
