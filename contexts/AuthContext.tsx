'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userData: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  registerStudent: (email: string, password: string, userData: any) => Promise<any>;
  registerTutor: (email: string, password: string, userData: any) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateUserData: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      setUserData(userData);
      
      toast.success('Login successful!');
      
      return { 
        success: true, 
        user: userCredential.user,
        userData 
      };
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Wrong password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Try again later';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const registerStudent = async (email: string, password: string, userData: any) => {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      // Create user document in Firestore
      const userDocData = {
        ...userData,
        email,
        uid: userCredential.user.uid,
        role: 'student',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEmailVerified: false,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDocData);

      // Fetch the created user data
      const createdUserDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const createdUserData = createdUserDoc.exists() ? createdUserDoc.data() : null;
      
      setUserData(createdUserData);
      
      toast.success('Account created successfully!');
      
      return { 
        success: true, 
        user: userCredential.user,
        userData: createdUserData
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  const createTutorAccount = async (email: string, password: string, userData: any) => {
  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: `${userData.firstName} ${userData.lastName}`,
    });

    // Create user document in Firestore
    const userDocData = {
      ...userData,
      email,
      uid: userCredential.user.uid,
      role: 'tutor_applicant',
      tutorStatus: 'pending_review',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isEmailVerified: false,
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDocData);

    // Create tutor profile document
    const tutorDocData = {
      userId: userCredential.user.uid,
      email: email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      status: 'pending_review',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'tutors', userCredential.user.uid), tutorDocData);

    // Fetch the created user data
    const createdUserDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const createdUserData = createdUserDoc.exists() ? createdUserDoc.data() : null;
    
    setUserData(createdUserData);
    
    return { 
      success: true, 
      user: userCredential.user,
      userData: createdUserData,
      password: password // Return password for email sending
    };
  } catch (error: any) {
    console.error('Tutor account creation error:', error);
    return { success: false, error: error.message };
  }
};

  const registerTutor = async (email: string, password: string, userData: any) => {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      // Create user document in Firestore
      const userDocData = {
        ...userData,
        email,
        uid: userCredential.user.uid,
        role: 'tutor_applicant',
        tutorStatus: 'pending_application',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEmailVerified: false,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDocData);

      // Create tutor application record
      const applicationData = {
        userId: userCredential.user.uid,
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        status: 'pending_payment', // Needs to pay to complete application
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'tutorApplications', userCredential.user.uid), applicationData);

      // Fetch the created user data
      const createdUserDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const createdUserData = createdUserDoc.exists() ? createdUserDoc.data() : null;
      
      setUserData(createdUserData);
      
      toast.success('Tutor application started! Please complete the application form.');
      
      return { 
        success: true, 
        user: userCredential.user,
        userData: createdUserData
      };
    } catch (error: any) {
      console.error('Tutor registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUserData = async (data: any) => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      // Refresh user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset email');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userData,
    loading,
    login,
    registerStudent,
    registerTutor,
    logout,
    resetPassword,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
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