import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://dtfbfwsmgktxhxbygcrp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZmJmd3NtZ2t0eGh4YnlnY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDg2NDUsImV4cCI6MjA5NjY4NDY0NX0.RVVxxifmAUC7bDol4BUw65nHGBOBXhIAj2YUsNled-E';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables.\n' +
    'Create apps/web/.env.local with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

