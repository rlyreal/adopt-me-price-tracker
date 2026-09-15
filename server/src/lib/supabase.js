import { createClient } from '@supabase/supabase-js'

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

if (required.some((key) => !process.env[key])) {
  console.warn('Supabase environment variables are missing. API requests will fail until configured.')
}

export const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  { auth: { autoRefreshToken: false, persistSession: false } }
)
