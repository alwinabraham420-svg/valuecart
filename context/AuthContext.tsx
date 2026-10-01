'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'operator';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const syncLocalCache = (u: any, p: any, s: any) => {
    setUser(u);
    setProfile(p);
    setSession(s);
    if (typeof window !== 'undefined') {
      if (u) {
        localStorage.setItem('valuecart_auth_user', JSON.stringify(u));
        localStorage.setItem('valuecart_auth_profile', JSON.stringify(p));
      } else {
        localStorage.removeItem('valuecart_auth_user');
        localStorage.removeItem('valuecart_auth_profile');
      }
    }
  };

  useEffect(() => {
    // 1. Instant hydration from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const cachedUser = localStorage.getItem('valuecart_auth_user');
        const cachedProfile = localStorage.getItem('valuecart_auth_profile');
        if (cachedUser && cachedProfile) {
          setUser(JSON.parse(cachedUser));
          setProfile(JSON.parse(cachedProfile));
        }
      } catch {
        // Ignore cache parse error
      }
    }

    // 2. Verify server session
    const checkServerSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            syncLocalCache(data.user, data.profile, data.session);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Session check warning:', err);
      }

      // 3. Fallback to Supabase if connected
      if (supabase) {
        try {
          const { data: { session: sbSession } } = await supabase.auth.getSession();
          if (sbSession?.user) {
            const sbUser = sbSession.user;
            const sbProfile: UserProfile = {
              id: sbUser.id,
              email: sbUser.email || '',
              full_name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Customer',
              phone: sbUser.user_metadata?.phone || '',
              role: (sbUser.app_metadata?.role as any) || 'customer',
            };
            syncLocalCache(sbUser as any, sbProfile, sbSession as any);
          }
        } catch (sbErr) {
          console.warn('Supabase session fallback warning:', sbErr);
        }
      }

      setLoading(false);
    };

    checkServerSession();
  }, [supabase]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<{ error: Error | null }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return { error: new Error(data.error || 'Failed to create account. Please try again.') };
      }

      syncLocalCache(data.user, data.profile, data.session);

      // Best effort background sync with Supabase
      if (supabase) {
        supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim(), phone: phone.trim() },
          },
        }).catch(() => {});
      }

      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Network error during account registration.') };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return {
          error: new Error(
            data.error || 'Invalid email or password. Please check your credentials.'
          ),
        };
      }

      syncLocalCache(data.user, data.profile, data.session);

      // Best effort background sync with Supabase
      if (supabase) {
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }).catch(() => {});
      }

      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Network error during sign in.') };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore supabase signout error
      }
    }

    syncLocalCache(null, null, null);
  };

  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          syncLocalCache(data.user, data.profile, data.session);
        }
      }
    } catch {
      // Ignore
    }
  };

  const isAdmin =
    profile?.role === 'admin' ||
    (user as any)?.app_metadata?.role === 'admin' ||
    user?.email?.includes('admin') ||
    false;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
