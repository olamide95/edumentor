import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
  addDoc,
} from 'firebase/firestore';
import { db } from './config';

// Collection references
export const usersCollection = collection(db, 'users');
export const tutorsCollection = collection(db, 'tutors'); // Changed from tutorsApplications
export const tutorApplicationsCollection = collection(db, 'tutorApplications');
export const studentsCollection = collection(db, 'students');
export const packagesCollection = collection(db, 'packages');
export const bookingsCollection = collection(db, 'bookings');
export const paymentsCollection = collection(db, 'payments');
export const sessionsCollection = collection(db, 'sessions');
export const messagesCollection = collection(db, 'messages');
export const reviewsCollection = collection(db, 'reviews');

// User-related functions
export const createUser = async (userId: string, userData: any) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return userRef;
};

export const getUser = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
};

export const updateUser = async (userId: string, userData: any) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  });
};

// Tutor-related functions
export const createTutor = async (tutorId: string, tutorData: any) => {
  const tutorRef = doc(db, 'tutors', tutorId);
  await setDoc(tutorRef, {
    ...tutorData,
    status: 'active', // active, inactive, suspended
    isAvailable: true,
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    totalEarnings: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return tutorRef;
};

export const getTutors = async (filters = {}) => {
  try {
    console.log("Fetching tutors with filters:", filters);
    
    // Create the base query for approved and active tutors
    let q = query(
      tutorsCollection,
      where('status', '==', 'active')
    );
    
    // Apply filters if provided
    if (filters.subject && filters.subject !== 'all') {
      q = query(q, where('subjects', 'array-contains', filters.subject));
    }
    
    if (filters.location && filters.location !== 'all') {
      q = query(q, where('location', '==', filters.location));
    }
    
    if (filters.package && filters.package !== 'all') {
      q = query(q, where('packages', 'array-contains', filters.package));
    }
    
    if (filters.minRate && filters.minRate > 0) {
      q = query(q, where('hourlyRate', '>=', parseInt(filters.minRate)));
    }
    
    if (filters.maxRate && filters.maxRate < 10000) {
      q = query(q, where('hourlyRate', '<=', parseInt(filters.maxRate)));
    }
    
    if (filters.availability) {
      q = query(q, where('isAvailable', '==', true));
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'rating-desc':
          q = query(q, orderBy('rating', 'desc'));
          break;
        case 'rating-asc':
          q = query(q, orderBy('rating', 'asc'));
          break;
        case 'rate-desc':
          q = query(q, orderBy('hourlyRate', 'desc'));
          break;
        case 'rate-asc':
          q = query(q, orderBy('hourlyRate', 'asc'));
          break;
        case 'sessions-desc':
          q = query(q, orderBy('totalSessions', 'desc'));
          break;
        default:
          q = query(q, orderBy('rating', 'desc'));
      }
    } else {
      q = query(q, orderBy('rating', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    const tutors = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${tutors.length} tutors`);
    return tutors;
  } catch (error) {
    console.error("Error in getTutors:", error);
    
    // Fallback: Get all tutors without filters if there's an error
    const q = query(
      tutorsCollection,
      where('status', '==', 'active'),
      orderBy('rating', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

export const getTutorById = async (tutorId: string) => {
  const tutorRef = doc(db, 'tutors', tutorId);
  const tutorSnap = await getDoc(tutorRef);
  return tutorSnap.exists() ? { id: tutorSnap.id, ...tutorSnap.data() } : null;
};

export const updateTutor = async (tutorId: string, tutorData: any) => {
  const tutorRef = doc(db, 'tutors', tutorId);
  await updateDoc(tutorRef, {
    ...tutorData,
    updatedAt: serverTimestamp(),
  });
};

// IMPORTANT: Function to migrate tutor applications to tutors collection


// Booking functions
export const createBooking = async (bookingData: any) => {
  try {
    // Check if booking already exists
    const existingBookings = await getStudentTutorBookings(
      bookingData.studentId, 
      bookingData.tutorId
    );
    
    // Check if there's an active or pending booking
    const activeBooking = existingBookings.find(booking => 
      ['pending', 'confirmed', 'active'].includes(booking.status)
    );
    
    if (activeBooking) {
      throw new Error('You have already indicated interest in this tutor');
    }
    
    // Check for recently cancelled bookings (within 24 hours)
    const recentCancelledBookings = existingBookings.filter(booking => {
      if (booking.status === 'cancelled' && booking.createdAt) {
        const bookingDate = booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return bookingDate > twentyFourHoursAgo;
      }
      return false;
    });
    
    if (recentCancelledBookings.length > 0) {
      throw new Error('You recently cancelled a booking with this tutor. Please wait 24 hours before trying again.');
    }
    
    // Create new booking
    const bookingRef = await addDoc(bookingsCollection, {
      ...bookingData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return bookingRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getBooking = async (bookingId: string) => {
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  return bookingSnap.exists() ? { id: bookingSnap.id, ...bookingSnap.data() } : null;
};

export const updateBooking = async (bookingId: string, bookingData: any) => {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    ...bookingData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteBooking = async (bookingId: string) => {
  const bookingRef = doc(db, 'bookings', bookingId);
  await deleteDoc(bookingRef);
};

// Payment functions
export const createPayment = async (paymentData: any) => {
  const paymentRef = await addDoc(paymentsCollection, {
    ...paymentData,
    status: 'pending', // pending, completed, failed, refunded
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return paymentRef.id;
};

export const updatePayment = async (paymentId: string, paymentData: any) => {
  const paymentRef = doc(db, 'payments', paymentId);
  await updateDoc(paymentRef, {
    ...paymentData,
    updatedAt: serverTimestamp(),
  });
};

export const getPayment = async (paymentId: string) => {
  const paymentRef = doc(db, 'payments', paymentId);
  const paymentSnap = await getDoc(paymentRef);
  return paymentSnap.exists() ? { id: paymentSnap.id, ...paymentSnap.data() } : null;
};

// Tutor application functions
export const createTutorApplication = async (applicationData: any) => {
  const applicationRef = await addDoc(tutorApplicationsCollection, {
    ...applicationData,
    status: 'pending_payment', // pending_payment, pending_review, approved, rejected
    appliedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return applicationRef.id;
};



export const getTutorApplicationByUserId = async (userId: string) => {
  const q = query(
    tutorApplicationsCollection,
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};



// Review functions
export const createReview = async (reviewData: any) => {
  const reviewRef = await addDoc(reviewsCollection, {
    ...reviewData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reviewRef.id;
};

export const getTutorReviews = async (tutorId: string) => {
  const q = query(
    reviewsCollection,
    where('tutorId', '==', tutorId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getStudentReviews = async (studentId: string) => {
  const q = query(
    reviewsCollection,
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Message functions
export const createMessage = async (messageData: any) => {
  const messageRef = await addDoc(messagesCollection, {
    ...messageData,
    read: false,
    createdAt: serverTimestamp(),
  });
  return messageRef.id;
};

export const getMessages = async (userId: string, userType: 'student' | 'tutor') => {
  const field = userType === 'student' ? 'studentId' : 'tutorId';
  const q = query(
    messagesCollection,
    where(field, '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const markMessageAsRead = async (messageId: string) => {
  const messageRef = doc(db, 'messages', messageId);
  await updateDoc(messageRef, {
    read: true,
    readAt: serverTimestamp(),
  });
};

// Package functions
export const getPackages = async () => {
  const q = query(packagesCollection, orderBy('price', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getPackageById = async (packageId: string) => {
  const packageRef = doc(db, 'packages', packageId);
  const packageSnap = await getDoc(packageRef);
  return packageSnap.exists() ? { id: packageSnap.id, ...packageSnap.data() } : null;
};

// Helper functions
export const formatTimestamp = (timestamp: Timestamp | string | Date) => {
  if (!timestamp) return '';
  
  let date: Date;
  
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return '';
  }
  
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (timestamp: Timestamp | string | Date) => {
  if (!timestamp) return '';
  
  let date: Date;
  
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return '';
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get all tutor applications (admin function)


// Add to your existing firestore.ts file

// Get all tutor applications with optional status filter
export const getAllTutorApplications = async (status = '') => {
  try {
    let q;
    if (status) {
      q = query(tutorApplicationsCollection, where('status', '==', status));
    } else {
      q = query(tutorApplicationsCollection);
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tutor applications:', error);
    throw error;
  }
};

// Get a single tutor application
export const getTutorApplication = async (applicationId: string) => {
  try {
    const applicationRef = doc(db, 'tutorApplications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      return null;
    }
    
    return {
      id: applicationSnap.id,
      ...applicationSnap.data()
    };
  } catch (error) {
    console.error('Error getting tutor application:', error);
    throw error;
  }
};
// In your firestore.ts file, add these functions:

// Check if a student already has a pending/active booking with a tutor
export const checkExistingBooking = async (studentId: string, tutorId: string) => {
  try {
    const q = query(
      bookingsCollection,
      where('studentId', '==', studentId),
      where('tutorId', '==', tutorId),
      where('status', 'in', ['pending', 'confirmed', 'active']) // Check for active statuses
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking existing booking:', error);
    return false;
  }
};

// Get all bookings for a student with a specific tutor
export const getStudentTutorBookings = async (studentId: string, tutorId: string) => {
  try {
    const q = query(
      bookingsCollection,
      where('studentId', '==', studentId),
      where('tutorId', '==', tutorId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting student-tutor bookings:', error);
    return [];
  }
};

// Update tutor application
export const updateTutorApplication = async (applicationId: string, updateData: any) => {
  try {
    const applicationRef = doc(db, 'tutorApplications', applicationId);
    await updateDoc(applicationRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating tutor application:', error);
    throw error;
  }
};

// Approve tutor application and create tutor profile
export const approveTutorApplication = async (applicationId: string) => {
  try {
    // Get the application
    const applicationRef = doc(db, 'tutorApplications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error('Application not found');
    }
    
    const applicationData = applicationSnap.data();
    
    // Create tutor ID (use userId or generate new)
    const tutorId = applicationData.userId || applicationId;
    const tutorRef = doc(db, 'tutors', tutorId);
    
    // Prepare tutor data
    const tutorData = {
      id: tutorId,
      userId: applicationData.userId,
      firstName: applicationData.firstName,
      lastName: applicationData.lastName,
      email: applicationData.userEmail,
      phone: applicationData.phone,
      profilePhoto: applicationData.documents?.profilePhoto?.url || '',
      qualification: applicationData.education?.degree || '',
      university: applicationData.education?.university || '',
      subjects: applicationData.teaching?.subjects || [],
      packages: applicationData.teaching?.packages || [],
      location: applicationData.personalInfo?.currentLocation || '',
      hourlyRate: parseInt(applicationData.teaching?.hourlyRate) || 2500,
      rating: 0,
      totalReviews: 0,
      experience: applicationData.teaching?.experience || '',
      bio: applicationData.teaching?.bio || '',
      isAvailable: true,
      verified: true,
      totalSessions: 0,
      teachingMode: [applicationData.teaching?.preferredMode || 'both'],
      status: 'active',
      nyscInfo: applicationData.nysc || {},
      educationInfo: applicationData.education || {},
      personalInfo: applicationData.personalInfo || {},
      documents: applicationData.documents || {},
      applicationId: applicationId,
      approvedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Create tutor document
    await setDoc(tutorRef, tutorData);
    
    // Update application status
    await updateDoc(applicationRef, {
      status: 'approved',
      tutorId: tutorId,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Update user role
    if (applicationData.userId) {
      const userRef = doc(db, 'users', applicationData.userId);
      await updateDoc(userRef, {
        role: 'tutor',
        tutorId: tutorId,
        tutorStatus: 'approved',
        updatedAt: serverTimestamp(),
      });
    }
    
    // Send notification email (implement separately)
    // await sendApprovalEmail(applicationData.userEmail, applicationData.firstName);
    
    return { success: true, tutorId, tutorData };
  } catch (error) {
    console.error('Error approving tutor application:', error);
    throw error;
  }
};

// Reject tutor application
export const rejectTutorApplication = async (applicationId: string, reason: string) => {
  try {
    const applicationRef = doc(db, 'tutorApplications', applicationId);
    
    await updateDoc(applicationRef, {
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Send rejection email (implement separately)
    // const app = await getTutorApplication(applicationId);
    // if (app) {
    //   await sendRejectionEmail(app.userEmail, app.firstName, reason);
    // }
    
    return { success: true };
  } catch (error) {
    console.error('Error rejecting tutor application:', error);
    throw error;
  }
};

// Send notification email function (placeholder - implement with your email service)
export const sendTutorApprovalEmail = async (email: string, name: string) => {
  // Implement email sending logic here
  // You can use Nodemailer, SendGrid, AWS SES, etc.
  console.log(`Sending approval email to ${email} for ${name}`);
  return true;
};

export const sendTutorRejectionEmail = async (email: string, name: string, reason: string) => {
  // Implement email sending logic here
  console.log(`Sending rejection email to ${email} for ${name}. Reason: ${reason}`);
  return true;
};