
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_KEY || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables. Login features will be disabled.');
}

// Create and export the Supabase client
export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);

export interface MockInterview {
    id: string;
    role_title: string;
    created_at: string;
    performance_score: number;
    status: 'completed' | 'in_progress' | 'failed';
}
