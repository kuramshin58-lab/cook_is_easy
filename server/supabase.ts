import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

console.log("Supabase URL configured:", supabaseUrl ? "Yes" : "No");
console.log("Supabase URL value:", supabaseUrl?.substring(0, 30) + "...");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
