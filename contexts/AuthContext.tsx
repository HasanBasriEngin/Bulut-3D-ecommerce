import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// User tipini genişleterek isAdmin özelliğini ekliyoruz
export interface ExtendedUser extends User {
  isAdmin?: boolean;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ADMIN MAIL ADRESİN
  const ADMIN_EMAIL = "info@bulut3dbaski.com";

  const handleUserSession = (sessionUser: User | null) => {
    if (sessionUser) {
      const extendedUser: ExtendedUser = {
        ...sessionUser,
        isAdmin: sessionUser.email === ADMIN_EMAIL
      };
      setUser(extendedUser);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Sayfa yenilendiğinde mevcut oturumu kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session?.user ?? null);
      setLoading(false);
    });

    // Giriş/Çıkış durumlarını dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth bir AuthProvider içinde kullanılmalıdır.');
  return context;
};