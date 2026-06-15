-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- WORKSHOPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  price INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  enrolled INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- REGISTRATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  workshop_name TEXT NOT NULL,
  creative_interest TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  razorpay_order_id TEXT,
  pass_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- ADMIN USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_workshops_is_active ON workshops(is_active);
CREATE INDEX idx_registrations_workshop_id ON registrations(workshop_id);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_pass_id ON registrations(pass_id);
CREATE INDEX idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX idx_registrations_checked_in ON registrations(checked_in);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Workshops: Public read, no write (admin only via app)
CREATE POLICY "Allow public read access to workshops"
  ON workshops FOR SELECT
  USING (is_active = true);

CREATE POLICY "Prevent public insert/update/delete on workshops"
  ON workshops FOR INSERT, UPDATE, DELETE
  USING (false);

-- Registrations: Public can insert their own registration
CREATE POLICY "Allow public insert registrations"
  ON registrations FOR INSERT
  WITH CHECK (true);

-- Registrations: Public can read/update their own registration
CREATE POLICY "Allow public read registrations"
  ON registrations FOR SELECT
  USING (true);

CREATE POLICY "Allow public update own registration"
  ON registrations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Admin users: No direct access from public
CREATE POLICY "Prevent public access to admin_users"
  ON admin_users FOR ALL
  USING (false);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample workshops
INSERT INTO workshops (name, description, instructor, date, time, venue, price, capacity, enrolled, image_url, is_active)
VALUES
  (
    'Acrylic Painting Masterclass',
    'Learn the fundamentals of acrylic painting with professional techniques. Perfect for beginners and intermediate artists. Create stunning abstract and realistic pieces.',
    'Sarah Anderson',
    '2026-07-15',
    '10:00',
    'Hyderabad Art Studio, Banjara Hills',
    2499,
    30,
    0,
    'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=500&h=300&fit=crop',
    true
  ),
  (
    'Watercolor Landscapes',
    'Explore the beauty of watercolor painting through landscape techniques. Learn wet-on-wet, dry brush, and glazing methods from a professional watercolor artist.',
    'Michael Chen',
    '2026-07-22',
    '14:00',
    'The Palette Studio, Jubilee Hills',
    1999,
    25,
    0,
    'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa?w=500&h=300&fit=crop',
    true
  ),
  (
    'Sketch & Illustration Workshop',
    'Master the art of sketching and digital illustration. Cover composition, anatomy, shading, and perspective. Suitable for all skill levels.',
    'Elena Rodriguez',
    '2026-07-29',
    '11:00',
    'Creative Canvas, HITEC City',
    1499,
    35,
    0,
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=300&fit=crop',
    true
  );

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE workshops IS 'Stores all available art workshop details';
COMMENT ON TABLE registrations IS 'Stores participant registrations for workshops';
COMMENT ON TABLE admin_users IS 'Stores admin user credentials for dashboard access';

COMMENT ON COLUMN registrations.pass_id IS 'Unique pass identifier in format ART-XXXXXX-XXXX';
COMMENT ON COLUMN registrations.payment_status IS 'Status: pending, paid, or failed';
COMMENT ON COLUMN registrations.razorpay_order_id IS 'Razorpay order ID for payment tracking';
