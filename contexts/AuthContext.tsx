import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { ExtendedUser } from '../types'; // types.ts dosyasından yeni yapıyı çekiyoruz
// User tipini genişleterek isAdmin özelliğini ekliyoruz


interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
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

 // 37. satırdaki boşluğa adminEmail tanımını ekle
const adminEmail = "info@bulut3dbaski.com"; 

useEffect(() => {
    // Sayfa ilk açıldığında oturumu kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
            const fullUser: ExtendedUser = {
                ...session.user,
                isAdmin: session.user.email?.toLowerCase() === adminEmail.toLowerCase()
            };
            setUser(fullUser);
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    // Giriş/Çıkış durumlarını anlık dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
            const fullUser: ExtendedUser = {
                ...session.user,
                isAdmin: session.user.email?.toLowerCase() === adminEmail.toLowerCase()
            };
            setUser(fullUser);
        } else {
            setUser(null);
        }
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

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };
  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth bir AuthProvider içinde kullanılmalıdır.');
  return context;
};