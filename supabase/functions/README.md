# Supabase Edge Functions

These edge functions handle Razorpay payment integration for the Art Workshop Registration Platform.

## Functions

### 1. `create-razorpay-order`

**Purpose:** Create a Razorpay order for payment processing

**Endpoint:** `POST /functions/v1/create-razorpay-order`

**Request Payload:**
```json
{
  "registration_id": "uuid",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "workshop_name": "Acrylic Painting",
  "amount": 2499
}
```

**Response:**
```json
{
  "order_id": "order_xxxxxxxxx",
  "key_id": "rzp_live_xxxxxxxx",
  "amount": 2499
}
```

**What it does:**
1. Validates payload
2. Calls Razorpay API to create an order
3. Stores `razorpay_order_id` in the registrations table
4. Returns order details to frontend

---

### 2. `verify-payment`

**Purpose:** Verify Razorpay payment and update registration status

**Endpoint:** `POST /functions/v1/verify-payment`

**Request Payload:**
```json
{
  "razorpay_payment_id": "pay_xxxxxxxxx",
  "razorpay_order_id": "order_xxxxxxxxx",
  "razorpay_signature": "signature_hash",
  "registration_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "pass_id": "ART-XXXXXX-XXXX",
  "message": "Payment verified successfully"
}
```

**What it does:**
1. Verifies HMAC-SHA256 signature using Razorpay key secret
2. Updates registration `payment_status` to `paid`
3. Stores payment details (payment_id, razorpay_order_id)
4. Increments workshop `enrolled` count
5. Returns pass_id for success page

---

## Setup

### Step 1: Set Environment Variables in Supabase

1. Go to Supabase Dashboard → **Settings → Edge Functions**
2. Set these secrets:
   - `RAZORPAY_KEY_ID` — Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET` — Your Razorpay Key Secret

**Get your Razorpay credentials:**
- Sign up at [razorpay.com](https://razorpay.com)
- Dashboard → Settings → API Keys
- Copy Key ID and Key Secret

### Step 2: Deploy Edge Functions

Using Supabase CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-payment
```

Or manually via Supabase Dashboard:
1. Go to **SQL Editor**
2. For each function, create via the Edge Functions UI

### Step 3: Test

```bash
# Get your function URL
supabase functions list

# Test create-razorpay-order
curl -X POST https://your-project.supabase.co/functions/v1/create-razorpay-order \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "registration_id": "test-id",
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "workshop_name": "Test Workshop",
    "amount": 1000
  }'
```

---

## Environment Variables Needed

In Supabase Dashboard → Settings → Edge Functions, set:

| Variable | Value |
|----------|-------|
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret |

---

## Security Notes

✅ **What's Secure:**
- HMAC-SHA256 signature verification prevents tampering
- Service role key used only on server-side (edge functions)
- Public anon key cannot bypass payment verification
- Razorpay credentials stored as Supabase secrets

⚠️ **Important:**
- Never expose `RAZORPAY_KEY_SECRET` to the frontend
- Always verify signatures server-side
- Use edge functions for all payment operations

---

Next: STEP 5 — Web app setup (Vite config, Tailwind, fonts, routing)
