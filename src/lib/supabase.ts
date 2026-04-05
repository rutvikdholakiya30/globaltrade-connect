import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'user'
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category_id: string
          description: string
          specifications: Json
          price: number | null
          images: string[]
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id: string
          description: string
          specifications?: Json
          price?: number | null
          images?: string[]
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string
          description?: string
          specifications?: Json
          price?: number | null
          images?: string[]
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          name: 'about' | 'privacy' | 'terms' | 'contact'
          content: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          name: 'about' | 'privacy' | 'terms' | 'contact'
          content: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          name?: 'about' | 'privacy' | 'terms' | 'contact'
          content?: string
          is_active?: boolean
          updated_at?: string
        }
      }
    }
  }
}
