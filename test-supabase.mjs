import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uyhnnoytjnwmzqymypah.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5aG5ub3l0am53bXpxeW15cGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzA3MDYsImV4cCI6MjA5MDk0NjcwNn0.WOlFVtJxJxHhpkmzMLHVB9Y2104WQQXPBGIPBSDueq8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Fetching products...");
  const p1 = supabase.from('products').select('id', { count: 'exact', head: true });
  const p2 = supabase.from('categories').select('id', { count: 'exact', head: true });
  const p3 = supabase.from('pages').select('id', { count: 'exact', head: true }).eq('is_active', true);
  const p4 = supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }).limit(5);
  
  console.log("Waiting for promises...");
  const results = await Promise.all([p1, p2, p3, p4]);
  console.log("Promises resolved!");
  console.log("Products Count Error:", results[0].error);
  console.log("Products Count:", results[0].count);
  console.log("Recent Error:", results[3].error);
}

test().catch(console.error);
