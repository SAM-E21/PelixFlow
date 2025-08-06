import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://krbsrumqgwdnbfjnkixf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyYnNydW1xZ3dkbmJmam5raXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMTQ5NjAsImV4cCI6MjA2MDU5MDk2MH0.KQE3WCszAeeLLPe7uWNvyhdIJb1hwuI3C4UuVZvFvdw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
