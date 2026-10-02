'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'operator';
}

export interface AuthResponse {
  data: any;
  error: AuthError | Error | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<AuthResponse>;
  updatePassword: (newPassword: string) => Promise<AuthResponse>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const fetchProfile = useCallback(
    async (userId: string, userEmail: string, userMeta?: Record<string, any>) => {
      if (!supabase) return;

      const fallbackProfile: UserProfile = {
        id: userId,
        email: userEmail,
        full_name: userMeta?.full_name || userEmail.split('@')[0] || 'Customer',
        phone: userMeta?.phone || '',
        role: 'customer',
      };

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, full_name, phone, role')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) {
          setProfile(data as UserProfile);
          return;
        }

        // Profile not found in public.users; attempt to create it
        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .upsert([fallbackProfile], { onConflict: 'id' })
          .select()
          .maybeSingle();

        if (!insertError && inserted) {
          setProfile(inserted as UserProfile);
        } else {
          setProfile(fallbackProfile);
        }
      } catch (err) {
        console.warn('[ValueCart Auth] Profile fetch handled gracefully:', err);
        setProfile(fallbackProfile);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Initial Session Check
    supabase.auth
      .getSession()
      .then((res: { data: { session: Session | null }; error: AuthError | null }) => {
        if (!isMounted) return;
        const initialSession = res.data.session;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          fetchProfile(
            initialSession.user.id,
            initialSession.user.email || '',
            initialSession.user.user_metadata
          );
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('[ValueCart Auth] Initial session error:', err);
        if (isMounted) setLoading(false);
      });

    // 2. Auth State Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, currentSession: Session | null) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(
          currentSession.user.id,
          currentSession.user.email || '',
          currentSession.user.user_metadata
        );
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<AuthResponse> => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          phone: cleanPhone,
        },
      },
    });

    if (error) {
      return { data: null, error };
    }

    // Anti-enumeration check: if an account already exists with this email,
    // Supabase returns a user with empty identities array
    if (data.user?.identities && data.user.identities.length === 0) {
      return {
        data,
        error: new Error('An account with this email already exists. Please sign in instead.'),
      };
    }

    // If session is returned immediately (Confirm email disabled in Supabase)
    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
      await fetchProfile(data.user.id, cleanEmail, {
        full_name: cleanName,
        phone: cleanPhone,
      });
      return { data, error: null };
    }

    // If Supabase created user but didn't attach session, attempt immediate automatic login
    const loginRes = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (loginRes.data?.session && loginRes.data?.user) {
      setSession(loginRes.data.session);
      setUser(loginRes.data.user);
      await fetchProfile(loginRes.data.user.id, cleanEmail, {
        full_name: cleanName,
        phone: cleanPhone,
      });
      return { data: loginRes.data, error: null };
    }

    if (loginRes.error) {
      return { data, error: loginRes.error };
    }

    return { data, error: null };
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
      await fetchProfile(data.user.id, cleanEmail, data.user.user_metadata);
    }

    return { data, error: null };
  };

  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[ValueCart Auth] Sign out warning:', err);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPasswordForEmail = async (email: string): Promise<AuthResponse> => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    const cleanEmail = email.trim().toLowerCase();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'https://valuecart.in');

    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });

    return { data, error };
  };

  const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { data, error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '', user.user_metadata);
    }
  };

  const refreshSession = async () => {
    if (!supabase) return;
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    if (currentSession?.user) {
      await fetchProfile(
        currentSession.user.id,
        currentSession.user.email || '',
        currentSession.user.user_metadata
      );
    }
  };

  const isAdmin =
    profile?.role === 'admin' ||
    (user as any)?.app_metadata?.role === 'admin' ||
    user?.email?.includes('admin') ||
    user?.email?.toLowerCase().trim() === 'alwinabraham420@gmail.com' ||
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
        resetPasswordForEmail,
        updatePassword,
        refreshProfile,
        refreshSession,
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
