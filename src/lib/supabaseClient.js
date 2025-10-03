import { createClient } from '@supabase/supabase-js'


// IMPORTANT: Replace with your Supabase project's URL and Anon Key
const supabaseUrl = 'https://kpprhogjzxwprgojlrhn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcHJob2dqenh3cHJnb2pscmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjMxMDAsImV4cCI6MjA3MDM5OTEwMH0.DhTH_DS548HuhwbtHBgYizrfaPda7wJ62hdfClmcQzk'

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
