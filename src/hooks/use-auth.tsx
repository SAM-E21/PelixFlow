
"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import type { ImproveRecommendationsOutput } from '@/ai/flows/improve-recommendations';
import type { Chat } from './use-chat-context';
import type { PreferenceFormValues } from '@/lib/types';
import type { CustomList } from './use-recommendation-context';


interface UserData {
    name: string;
    email: string;
    photoURL?: string;
    id_PelixFlow?: string;
    favorites?: ImproveRecommendationsOutput;
    history?: ImproveRecommendationsOutput;
    recommendations?: ImproveRecommendationsOutput;
    chats?: Chat[];
    preferences?: PreferenceFormValues;
    lists?: CustomList[];
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  reloadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    try {
        let pelixFlowId: string | undefined = undefined;

        // Fetch from Supabase safely
        if (user.email) {
            try {
                const { data: supabaseUser, error } = await supabase
                    .from('Universal')
                    .select('id_PelixFlow')
                    .eq('email', user.email)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.warn("Supabase query error:", error.message); // Log as warning, don't throw
                } else if (supabaseUser) {
                    pelixFlowId = supabaseUser.id_PelixFlow;
                }
            } catch (supabaseError) {
                console.warn("Could not fetch data from Supabase:", supabaseError);
            }
        }
        
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const dbData = userDoc.data() as Omit<UserData, 'id_PelixFlow'>; 
          setUserData({
              name: dbData.name || user.displayName || "",
              email: dbData.email || user.email || "",
              photoURL: dbData.photoURL || user.photoURL || undefined,
              id_PelixFlow: pelixFlowId,
              favorites: dbData.favorites || [],
              history: dbData.history || [],
              recommendations: dbData.recommendations || [],
              chats: dbData.chats || [],
              preferences: dbData.preferences,
              lists: dbData.lists || [],
          });
        } else {
             const initialData: UserData = {
                name: user.displayName || "",
                email: user.email || "",
                photoURL: user.photoURL || undefined,
                id_PelixFlow: pelixFlowId,
                favorites: [],
                history: [],
                recommendations: [],
                chats: [],
                lists: [],
            };
            await setDoc(userDocRef, initialData, { merge: true });
            setUserData(initialData);
        }
    } catch(e: any) {
        console.error("Error fetching user data:", e.message || e);
        setUserData({
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || undefined,
        });
    }
  }, []);

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
        await setDoc(userDocRef, data, { merge: true });
        // Optimistically update local state
        setUserData(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
        console.error("Error updating user data:", error);
    }
  };

  const reloadUserData = useCallback(async () => {
    if (auth.currentUser) {
      setLoading(true);
      await auth.currentUser.reload();
      const refreshedUser = auth.currentUser;
      if (refreshedUser) {
        setUser(refreshedUser);
        await fetchUserData(refreshedUser);
      }
      setLoading(false);
    }
  }, [fetchUserData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        await fetchUserData(user);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, userData, loading, reloadUserData, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}
