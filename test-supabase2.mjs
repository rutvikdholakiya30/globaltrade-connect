import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uyhnnoytjnwmzqymypah.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5aG5ub3l0am53bXpxeW15cGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzA3MDYsImV4cCI6MjA5MDk0NjcwNn0.WOlFVtJxJxHhpkmzMLHVB9Y2104WQQXPBGIPBSDueq8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'rutvikdholakiya30@gmail.com',
    password: 'Admin@123',
  });
  
  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }
  console.log("Logged in:", auth.user.email);

  try {
    const [productsRes, categoriesRes, pagesRes, recentRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('pages').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }).limit(5)
    ]);
    console.log("P", productsRes.error);
    console.log("C", categoriesRes.error);
    console.log("PG", pagesRes.error);
    console.log("R", recentRes.error);
  } catch(e) {
    console.error("PROMISE REJECTED:", e);
  }
}

test().catch(console.error);
