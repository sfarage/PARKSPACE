import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

function withTimeout<T>(p: PromiseLike<T>, ms = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

// Extended user type that includes profile data
export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: 'global_admin' | 'company_admin' | 'member';
  companyId: number | null;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  invitedBy: string | null;
  lastActiveAt: string | null;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserProfile = async (supabaseUser: SupabaseUser): Promise<ExtendedUser | null> => {
    try {
      const { data: profile, error } = await withTimeout<any>(
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single(),
        5000
      );

      if (error || !profile) {
        console.warn('profiles fetch error:', error);
        return {
          id: supabaseUser.id,
          email: supabaseUser.email ?? '',
          name: supabaseUser.user_metadata?.name ?? 'User',
          role: 'member' as const,
          companyId: null,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          invitedBy: null,
          lastActiveAt: null,
        } as ExtendedUser; // temporary minimal profile
      }

      return {
        id: profile.id as string,
        email: profile.email as string,
        name: profile.name as string,
        role: profile.role as 'global_admin' | 'company_admin' | 'member',
        companyId: profile.company_id as number | null,
        status: profile.status as 'active' | 'pending' | 'suspended',
        createdAt: profile.created_at as string,
        invitedBy: profile.invited_by as string | null,
        lastActiveAt: profile.last_active_at as string | null,
      };
    } catch (e) {
      console.warn('profiles fetch timed out/failed:', e);
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        const profile = await getUserProfile(supabaseUser);
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const profile = await getUserProfile(data.user);
        
        if (profile) {
          setUser(profile);
          
          // Update last active timestamp
          await supabase
            .from('user_profiles')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', data.user.id);
          
          return {};
        } else {
          return { error: 'User profile not found. Please contact an administrator.' };
        }
      }

      return { error: 'Authentication failed' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Get initial session with retry logic
    async function getSessionWithRetry(maxAttempts = 3) {
      let lastError: unknown = null;
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          console.log(`🔍 Getting initial session (attempt ${attempt + 1}/${maxAttempts})...`);
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          console.log('🔍 Session result:', session ? 'Found session' : 'No session');
          return session;
          
        } catch (error) {
          lastError = error;
          console.warn(`⚠️ Session fetch attempt ${attempt + 1} failed:`, error);
          
          // Wait before retry (1s, 2s, 3s backoff)
          if (attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }
      
      console.warn('❌ Initial session fetch failed after all attempts:', lastError);
      return null;
    }

    // Initialize session
    const initializeSession = async () => {
      try {
        const session = await getSessionWithRetry(3);
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('🔍 Getting profile for session user...');
          const profile = await withTimeout(getUserProfile(session.user), 5000);
          if (mounted) {
            setUser(profile);
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        // Ignore token refresh noise: don't refetch profile
        if (event === 'TOKEN_REFRESHED' && !!session?.user) return;

        setLoading(true);
        try {
          if (session?.user) {
            console.log('🔍 Getting profile for auth change...');
            const profile = await withTimeout(getUserProfile(session.user), 5000);
            if (mounted) setUser(profile);
          } else {
            if (mounted) setUser(null);
          }
        } catch (e) {
          console.error('❌ getUserProfile (auth change) failed or timed out:', e);
          if (mounted) setUser(null);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};