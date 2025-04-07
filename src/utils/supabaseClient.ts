import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://ngpdfyhvlztueekbksju.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncGRmeWh2bHp0dWVla2Jrc2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzM0NjAsImV4cCI6MjA0OTQwOTQ2MH0.Olp8iIldDi_z-2Ooz0zi_WluJ5oF12sCQRFVOsPRnrw';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
