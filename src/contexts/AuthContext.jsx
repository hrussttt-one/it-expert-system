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
        console.error('Profile fetch error (likely expired session):', error.message);
        return false;
      }

      profileCacheRef.current = data;
      setProfile(data);
      return true;
    } catch (error) {
      console.error('Profile fetch exception:', error);
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
          // Session token is expired/invalid — profile fetch failed
          console.warn('Session appears expired, clearing auth state');
          clearSession();
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth init error:', err);
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
          // Token refresh failed — force logout
          console.warn('Token refresh failed, clearing session');
          clearSession();
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const profileOk = await fetchProfile(session.user.id);
          if (!mountedRef.current) return;

          if (!profileOk) {
            console.warn('Profile fetch failed after auth change, clearing session');
            clearSession();
          }
          setLoading(false);
        }
      }
    );

    initAuth();

    // Safety timeout — if loading takes more than 5s, something is wrong
    const timeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('Auth loading timeout — forcing ready state');
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
    } catch (e) {
      // signOut can fail if session is already expired — that's OK
      console.warn('signOut error (safe to ignore):', e.message);
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
