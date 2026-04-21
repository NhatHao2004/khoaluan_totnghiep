import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (base64Data: string) => Promise<void>;
  updateProfileName: (newName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch additional user data from Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Update profile in Auth
    await updateProfile(newUser, {
      displayName: name
    });

    // Save to Firestore
    const userData = {
      uid: newUser.uid,
      fullName: name,
      email: email,
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', newUser.uid), userData);
    setUserData(userData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateAvatar = async (base64Data: string) => {
    if (!user) {
      console.error('Update avatar failed: User not initialized');
      return;
    }

    try {
      const photoURL = `data:image/jpeg;base64,${base64Data}`;

      // 1. Update Firestore (Lưu vào Database vì Firestore cho phép dữ liệu lớn)
      await setDoc(doc(db, 'users', user.uid), { photoURL }, { merge: true });
      
      // 2. Update local state để giao diện thay đổi ngay lập tức
      setUserData((prev: any) => ({ ...prev, photoURL }));
      
    } catch (error: any) {
      console.error('Error updating avatar (Base64):', error);
      throw error;
    }
  };

  const updateProfileName = async (newName: string) => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: newName });
      await setDoc(doc(db, 'users', user.uid), { fullName: newName }, { merge: true });
      setUserData((prev: any) => ({ ...prev, fullName: newName }));
    } catch (error: any) {
      console.error('Error updating profile name:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, userData, loading, login, register, logout, updateAvatar, updateProfileName 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
