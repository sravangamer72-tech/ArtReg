# Art Workshop Registration Platform

A premium art workshop registration platform featuring multi-step registration, Razorpay payment integration, digital QR pass generation, and admin dashboard with check-in system.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS v3 + Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments:** Razorpay
- **Components:** lucide-react, qrcode.react, recharts, xlsx

## Project Structure

```
art-workshop-platform/
├── apps/
│   ├── web/              # Public registration website
│   └── admin/            # Admin dashboard
├── packages/
│   └── shared/           # Shared types, utilities, clients
├── supabase/             # Edge functions & schema
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- Supabase account & project
- Razorpay account

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local` in both `apps/web` and `apps/admin`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=your-razorpay-key
```

### Development

```bash
# Web app
npm run dev:web

# Admin app
npm run dev:admin

# Both
npm run dev
```

### Build

```bash
npm run build
```

## Features

- ✨ Premium glassmorphism UI with gradient text
- 📝 Multi-step registration with smooth animations
- 💳 Razorpay payment integration
- 🎟️ Digital pass with QR codes
- 📊 Admin dashboard with analytics
- 🔍 QR code check-in system
- 📱 Fully responsive design

---

Updated at end of project.
