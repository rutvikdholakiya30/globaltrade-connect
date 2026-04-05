import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import { UserProfile } from '@/src/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchSessionAndProfile(session: any) {
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) console.error("Profile fetch error:", error);
          if (mounted) setProfile(data);
        } catch (error) {
          console.error('Error fetching profile:', error);
          if (mounted) setProfile(null);
        }
      } else {
        if (mounted) setProfile(null);
      }
      if (mounted) setLoading(false);
    }

    // Explicitly call getSession() to guarantee initialization
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) fetchSessionAndProfile(session);
    });

    // Listen for subsequent changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore initial session to prevent double-fetching deadlock
      if (event === 'INITIAL_SESSION') return;
      if (mounted) fetchSessionAndProfile(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
