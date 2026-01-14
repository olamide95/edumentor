import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './firebase/config';
import { createUser, getUser } from './firebase/firestore';

export const registerUser = async (
  email: string,
  password: string,
  userData: any
) => {
  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: `${userData.firstName} ${userData.lastName}`,
    });
    
    // Create user in Firestore
    await createUser(userCredential.user.uid, {
      ...userData,
      email,
      role: userData.role || 'student',
      isEmailVerified: false,
    });
    
    // If registering as tutor, also create tutor document
    if (userData.role === 'tutor') {
      await createTutor(userCredential.user.uid, {
        ...userData.tutorInfo,
        userId: userCredential.user.uid,
      });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // Get user data from Firestore
    const userData = await getUser(userCredential.user.uid);
    
    return { 
      success: true, 
      user: userCredential.user,
      userData 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};