import { db } from './config';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export const createTutorApplication = async (applicationData: any) => {
  try {
    const applicationsCollection = collection(db, 'tutorApplications');
    
    const application = {
      ...applicationData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(applicationsCollection, application);
    return docRef.id;
  } catch (error) {
    console.error('Error creating tutor application:', error);
    throw error;
  }
};

export const updateTutorApplication = async (applicationId: string, updates: any) => {
  try {
    const applicationRef = doc(db, 'tutorApplications', applicationId);
    await updateDoc(applicationRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating tutor application:', error);
    throw error;
  }
};