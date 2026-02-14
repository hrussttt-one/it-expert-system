import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const profileCacheRef = useRef(null);

  // Force clear all Supabase session data from localStorage
  const clearSession = useCallback(() => {
    setUser(null);
    setProfile(null);
    profileCacheRef.current = null;
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    // Skip if we already have this profile cached
    if (profileCacheRef.current?.id === userId) {
      setProfile(profileCacheRef.current);
      return true;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        return false;
      }

      profileCacheRef.current = data;
      setProfile(data);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mountedRef.current) return;

        if (error || !session?.user) {
          // No valid session — clear everything and go to login
          clearSession();
          setLoading(false);
          return;
        }

        // Session exists — verify it's still valid by fetching profile
        setUser(session.user);
        const profileOk = await fetchProfile(session.user.id);

        if (!mountedRef.current) return;

        if (!profileOk) {
          clearSession();
        }

        setLoading(false);
      } catch {
        // Auth init failed — clear session silently
        if (mountedRef.current) {
          clearSession();
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          clearSession();
          setLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED' && !session) {
          clearSession();
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const profileOk = await fetchProfile(session.user.id);
          if (!mountedRef.current) return;

          if (!profileOk) {
            clearSession();
          }
          setLoading(false);
        }
      }
    );

    initAuth();

    const timeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        setLoading(false);
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchProfile, clearSession]);

  const signIn = useCallback(async (email, password) => {
    // Clear any stale session data before attempting login
    profileCacheRef.current = null;
    const result = await supabase.auth.signInWithPassword({ email, password });
    return result;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut can fail if session is already expired — that's OK
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
  }), [user, profile, loading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
