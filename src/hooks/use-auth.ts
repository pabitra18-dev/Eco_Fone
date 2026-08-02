
"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { 
  User,
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

const MASTER_ADMIN_EMAILS = ["bhattaaryan123@gmail.com"];
const ADMIN_EMAILS = ["bibek976171@gmail.com"];

interface AuthContextType {
    isAuthenticated: boolean | null;
    user: User | null;
    isAdmin: boolean | null;
    isMasterAdmin: boolean | null;
    login: (email:string, pass:string) => Promise<void>;
    signup: (name: string, email:string, phone: string, pass:string) => Promise<void>;
    logout: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isMasterAdmin, setIsMasterAdmin] = useState<boolean | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const checkAdminRole = useCallback(async (user: User | null): Promise<{ isAdmin: boolean, isMasterAdmin: boolean }> => {
      if (!user || !user.email) {
        return { isAdmin: false, isMasterAdmin: false };
      }
      
      if (MASTER_ADMIN_EMAILS.includes(user.email)) {
        return { isAdmin: true, isMasterAdmin: true };
      }
       if (ADMIN_EMAILS.includes(user.email)) {
        return { isAdmin: true, isMasterAdmin: false };
      }
      
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        
        if (userData) {
            const isMaster = userData.role === 'Master Admin';
            const isAdminRole = isMaster || userData.role === 'Admin';
            return { isAdmin: isAdminRole, isMasterAdmin: isMaster };
        }
      } catch (error) {
          console.error("Error checking admin role:", error);
      }
      
      return { isAdmin: false, isMasterAdmin: false };
    }, []);

    const handleUserAuthentication = useCallback(async (user: User) => {
        // Step 1: Set session cookie
        const token = await user.getIdToken();
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
        });

        // Step 2: Check for admin roles and local user state
        const { isAdmin, isMasterAdmin } = await checkAdminRole(user);
        setUser(user);
        setIsAuthenticated(true);
        setIsAdmin(isAdmin);
        setIsMasterAdmin(isMasterAdmin);

        // Step 3: Redirect
        if (isAdmin) {
            router.push('/admin');
        } else {
            router.push('/');
        }
    }, [checkAdminRole, router]);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && currentUser.emailVerified) {
                setUser(currentUser);
                setIsAuthenticated(true);
                const {isAdmin, isMasterAdmin} = await checkAdminRole(currentUser);
                setIsAdmin(isAdmin);
                setIsMasterAdmin(isMasterAdmin);

            } else {
                 setUser(null);
                setIsAuthenticated(false);
                setIsAdmin(false);
                setIsMasterAdmin(false);
            }
        });

        return () => unsubscribe();
    }, [checkAdminRole]);

    
    const login = async (email: string, pass: string) => {
      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, pass);
          
          if (!userCredential.user.emailVerified) {
              await sendEmailVerification(userCredential.user);
              await signOut(auth); // Log out the user immediately
              throw new Error("Email not verified. Please check your inbox for a verification link.");
          }
          await handleUserAuthentication(userCredential.user);

      } catch (error: any) {
          if (error.code === 'auth/invalid-credential') {
              try {
                  const unverifiedUser = auth.currentUser;
                  if(unverifiedUser && !unverifiedUser.emailVerified) {
                      await sendEmailVerification(unverifiedUser);
                      throw new Error("Email not verified. A new verification link has been sent.");
                  }
              } catch (e) {
                   throw error;
              }
          }
          throw error; // Re-throw other errors
      }
    };

    const signup = async (name: string, email: string, phone: string, pass: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        if (user) {
            await updateProfile(user, { displayName: name });
            
            let userRole: 'User' | 'Admin' | 'Master Admin' = 'User';
             if (MASTER_ADMIN_EMAILS.includes(email)) {
               userRole = 'Master Admin';
             } else if (ADMIN_EMAILS.includes(email)) {
               userRole = 'Admin';
             }

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                phone: phone,
                role: userRole,
                createdAt: new Date(),
                avatar: user.photoURL,
            });

            await sendEmailVerification(user);
            await signOut(auth); // Sign out user until they verify their email
        }
    }
    
    const logout = async () => {
        await signOut(auth);
        await fetch('/api/auth/session', { method: 'DELETE' });
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsMasterAdmin(false);
        router.push('/auth/login');
    };

    const getIdToken = useCallback(async (): Promise<string | null> => {
        if (isAuthenticated === null) {
            await new Promise<void>(resolve => {
                const unsubscribe = onAuthStateChanged(auth, user => {
                    unsubscribe();
                    resolve();
                });
            });
        }
        
        if (!auth.currentUser) return null;
        
        try {
            return await auth.currentUser.getIdToken(true);
        } catch (error) {
            console.error("Error getting ID token:", error);
            await logout();
            return null;
        }
    }, [isAuthenticated, logout]);

    const value: AuthContextType = { 
        isAuthenticated, 
        user, 
        isAdmin,
        isMasterAdmin,
        login,
        signup, 
        logout,
        getIdToken
    };

    return React.createElement(AuthContext.Provider, { value }, children);
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
