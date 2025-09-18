import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  suburb?: string;
  city?: string;
  province?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('[AuthProvider] Mounting AuthProvider...');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthProvider] useEffect - getting initial session...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthProvider] Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthProvider] Auth state changed: ${event}`, session);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('[AuthProvider] Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log(`[AuthProvider] Fetching profile for user ID: ${userId}`);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthProvider] Error fetching profile:', error);
      } else {
        console.log('[AuthProvider] Profile fetched:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('[AuthProvider] Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('[AuthProvider] Refreshing profile...');
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    console.log('[AuthProvider] Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('[AuthProvider] Signed out successfully');
    } catch (error) {
      console.error('[AuthProvider] Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  console.log('[AuthProvider] Context value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  console.log('[useAuth] useContext(AuthContext) value:', context);
  
  if (context === undefined) {
    console.error('[useAuth] ERROR: useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
