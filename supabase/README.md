# Supabase Setup Guide

This directory contains all Supabase configuration and edge functions for the Art Workshop Registration Platform.

## Schema Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Create a new project (e.g., "art-workshop-platform")
3. Wait for the project to initialize (~2 minutes)
4. Note your project URL and Anon Key from Settings → API

### Step 2: Apply Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `schema.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Verify: You should see 3 workshops in the `workshops` table

### What Gets Created

**Tables:**
- `workshops` — 3 sample workshops (Acrylic ₹2499, Watercolor ₹1999, Sketch ₹1499)
- `registrations` — Participant data with payment tracking
- `admin_users` — Admin credentials

**RLS Policies:**
- Workshops: Public read-only
- Registrations: Public can insert/read/update
- Admin Users: Private (accessed via admin app only)

**Indexes:**
- Fast queries on workshop status, payment, check-in status

### Environment Variables

Create `.env.local` in both `apps/web` and `apps/admin`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: Supabase Dashboard → Settings → API

### Verify Setup

In Supabase SQL Editor:

```sql
SELECT COUNT(*) FROM workshops;
-- Should return 3

SELECT * FROM workshops LIMIT 1;
-- Should show Acrylic Painting workshop
```

---

Next: Edge Functions (Razorpay integration) in STEP 4
