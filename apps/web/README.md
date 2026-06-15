# ArtFlow Web App

Public registration website for art workshops with multi-step form, Razorpay payment, and digital pass generation.

## Development

```bash
# Start development server
npm run dev:web

# Build for production
npm run build:web

# Type check
npm run type-check
```

## Environment Variables

Create `.env.local` in `apps/web/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Project Structure

```
src/
├── pages/
│   ├── LandingPage.tsx       # Home page with workshops list
│   ├── RegisterPage.tsx      # 5-step registration form
│   └── SuccessPage.tsx       # Pass download & QR code
├── components/
│   └── ui/                   # Reusable UI components
├── App.tsx
├── main.tsx
└── index.css
```

## Build System

- **Bundler:** Vite 5
- **React:** 18.2
- **TypeScript:** 5.3
- **Styling:** Tailwind CSS 3.3

## Features

- ✨ Glassmorphism UI with dark theme
- 🎨 Custom Tailwind design system
- 🔤 Premium fonts (Syne, Inter, JetBrains Mono)
- 📱 Fully responsive design
- 🚀 Fast Vite build

---

Next: STEP 6 — Reusable UI components
