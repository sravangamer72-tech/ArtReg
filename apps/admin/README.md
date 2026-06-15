# ArtFlow Admin Dashboard

Admin dashboard for art workshop management with registrations, check-in, and analytics.

## Development

```bash
# Start development server
npm run dev:admin

# Build for production
npm run build:admin

# Type check
npm run type-check
```

## Environment Variables

Create `.env.local` in `apps/admin/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
src/
├── pages/
│   ├── LoginPage.tsx         # Admin login
│   ├── DashboardPage.tsx     # Analytics & stats
│   ├── RegistrationsPage.tsx # Registration table
│   └── CheckinPage.tsx       # QR scanner
├── components/
│   └── ui/                   # Shared UI components
├── App.tsx
├── main.tsx
└── index.css
```

## Build System

- **Bundler:** Vite 5
- **React:** 18.2
- **TypeScript:** 5.3
- **Styling:** Tailwind CSS 3.3
- **Charts:** Recharts
- **Export:** XLSX

---

Next: STEP 11 — Admin app setup (full)
