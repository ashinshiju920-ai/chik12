import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { User, Address } from '../types';

export interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  saveAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync user profile with Firestore 'users' collection
  const syncUserToFirestore = async (fbUser: FirebaseUser, extraData?: { name?: string; addresses?: Address[] }) => {
    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      const defaultAvatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
      const resolvedName = extraData?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'DivaChic Member';

      if (!userSnap.exists()) {
        const initialUserData: User = {
          id: fbUser.uid,
          name: resolvedName,
          email: fbUser.email || '',
          avatar: defaultAvatar,
          addresses: extraData?.addresses || []
        };
        await setDoc(userDocRef, {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: resolvedName,
          photoURL: defaultAvatar,
          addresses: initialUserData.addresses,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        }, { merge: true });
        setCurrentUser(initialUserData);
      } else {
        const data = userSnap.data();
        const updatedUser: User = {
          id: fbUser.uid,
          name: data.displayName || resolvedName,
          email: fbUser.email || data.email || '',
          phone: data.phone,
          avatar: data.photoURL || defaultAvatar,
          addresses: data.addresses || []
        };
        await setDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      console.warn('[Firebase Auth] Firestore user sync notice:', err);
      setCurrentUser({
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'DivaChic Member',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        addresses: []
      });
    }
  };

  // Listen to Firebase Auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await syncUserToFirestore(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/Password sign up: createUserWithEmailAndPassword(auth, email, password)
  const signupWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      await syncUserToFirestore(user, { name: displayName });
      return { success: true };
    } catch (err: any) {
      console.error('[Firebase Auth] Signup error:', err);
      let message = err?.message || 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      return { success: false, error: message };
    }
  };

  // Email/Password login: signInWithEmailAndPassword(auth, email, password)
  const loginWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncUserToFirestore(userCredential.user);
      return { success: true };
    } catch (err: any) {
      console.error('[Firebase Auth] Login error:', err);
      let message = err?.message || 'Invalid credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check and try again.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a moment before trying again.';
      }
      return { success: false, error: message };
    }
  };

  // Google One-Click login: signInWithPopup(auth, googleProvider)
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserToFirestore(result.user);
      return { success: true };
    } catch (err: any) {
      console.error('[Firebase Auth] Google login error:', err);
      let message = err?.message || 'Google authentication failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was closed.';
      }
      return { success: false, error: message };
    }
  };

  // Logout: signOut(auth)
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (err) {
      console.error('[Firebase Auth] Logout error:', err);
    }
  };

  // Profile Updates
  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser || !firebaseUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);

    if (data.name) {
      try {
        await updateProfile(firebaseUser, { displayName: data.name });
      } catch (e) {
        console.warn('Firebase updateProfile name warning:', e);
      }
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        displayName: updated.name,
        phone: updated.phone || null,
        photoURL: updated.avatar,
        addresses: updated.addresses,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore profile update warning:', err);
    }
  };

  // Address Management
  const saveAddress = async (addressData: Omit<Address, 'id'>) => {
    if (!currentUser || !firebaseUser) return;
    const newAddr: Address = {
      ...addressData,
      id: `addr-${Date.now()}`
    };
    let updatedAddresses = [...(currentUser.addresses || [])];
    if (newAddr.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddr);
    await updateUserProfile({ addresses: updatedAddresses });
  };

  const deleteAddress = async (addressId: string) => {
    if (!currentUser) return;
    const updatedAddresses = (currentUser.addresses || []).filter((a) => a.id !== addressId);
    await updateUserProfile({ addresses: updatedAddresses });
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!currentUser) return;
    const updatedAddresses = (currentUser.addresses || []).map((a) => ({
      ...a,
      isDefault: a.id === addressId
    }));
    await updateUserProfile({ addresses: updatedAddresses });
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        loading,
        isLoggedIn: Boolean(currentUser),
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        updateUserProfile,
        saveAddress,
        deleteAddress,
        setDefaultAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
