// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.SUPABASE_URL || 'https://zghwhhjtxylurrxlsceq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaHdoaGp0eHlsdXJyeGxzY2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI5NDA3NTAsImV4cCI6MjAyODUxNjc1MH0.LPObkaKJOOTHtuExkU0aclfNtKA3UCQIC6hMGdw-ZME';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// Export a function to get the service role client (for admin operations)
export const getServiceRoleClient = (serviceRoleKey: string) => {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};
