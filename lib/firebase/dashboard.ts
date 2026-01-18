import { 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  collection, 
  orderBy,
  collectionGroup,
  limit,
  updateDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './config';

// Collection references
const usersCollection = collection(db, 'users');
const tutorsCollection = collection(db, 'tutors');
const bookingsCollection = collection(db, 'bookings');
const paymentsCollection = collection(db, 'payments');
const sessionsCollection = collection(db, 'sessions');

export const getTutorStats = async (tutorId: string) => {
  try {
    // Get tutor document
    const tutorDoc = await getDoc(doc(db, 'tutors', tutorId));
    const tutor = tutorDoc.data();

    if (!tutor) {
      return {
        totalEarnings: 0,
        activeStudents: 0,
        completedSessions: 0,
        rating: 0,
        totalReviews: 0,
        pendingSessions: 0,
      };
    }

    // Get tutor's bookings
    const bookingsQuery = query(
      bookingsCollection,
      where('tutorId', '==', tutorId)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate stats
    const completedSessions = bookings.filter(b => b.status === 'completed').length;
    const pendingSessions = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
    
    // Get unique students
    const studentIds = Array.from(new Set(bookings.map(b => b.studentId)));
    const activeStudents = studentIds.length;

    // Calculate total earnings from completed sessions
    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, booking) => sum + (parseFloat(booking.amount) || 0), 0);

    return {
      totalEarnings,
      activeStudents,
      completedSessions,
      pendingSessions,
      rating: tutor.rating || 0,
      totalReviews: tutor.totalReviews || 0,
      totalSessions: bookings.length,
      hourlyRate: tutor.hourlyRate || 0,
      subjects: tutor.subjects || [],
    };
  } catch (error) {
    console.error('Error getting tutor stats:', error);
    return {
      totalEarnings: 0,
      activeStudents: 0,
      completedSessions: 0,
      rating: 0,
      totalReviews: 0,
      pendingSessions: 0,
    };
  }
};

export const getStudentStats = async (studentId: string) => {
  try {
    // Get student's bookings
    const bookingsQuery = query(
      bookingsCollection,
      where('studentId', '==', studentId)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate stats
    const activeSessions = bookings.filter(b => 
      b.status === 'confirmed' || b.status === 'pending'
    ).length;
    
    const completedSessions = bookings.filter(b => b.status === 'completed').length;
    const cancelledSessions = bookings.filter(b => b.status === 'cancelled').length;
    
    // Calculate total spent
    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, booking) => sum + (parseFloat(booking.amount) || 0), 0);

    // Get unique tutors
    const tutorIds = Array.from(new Set(bookings.map(b => b.tutorId)));
    const totalTutors = tutorIds.length;

    // Calculate completion rate
    const totalBookings = bookings.length;
    const completionRate = totalBookings > 0 
      ? Math.round((completedSessions / totalBookings) * 100)
      : 0;

    return {
      activeSessions,
      completedSessions,
      cancelledSessions,
      totalSpent,
      totalTutors,
      completionRate,
      totalBookings,
    };
  } catch (error) {
    console.error('Error getting student stats:', error);
    return {
      activeSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      totalSpent: 0,
      totalTutors: 0,
      completionRate: 0,
      totalBookings: 0,
    };
  }
};

export const getTutorBookings = async (tutorId: string) => {
  try {
    const q = query(
      bookingsCollection,
      where('tutorId', '==', tutorId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tutor bookings:', error);
    return [];
  }
};

export const getUserBookings = async (userId: string, userType: 'student' | 'tutor') => {
  try {
    const field = userType === 'student' ? 'studentId' : 'tutorId';
    const q = query(
      bookingsCollection,
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return [];
  }
};

export const getRecentPayments = async (userId: string, userType: 'student' | 'tutor') => {
  try {
    const field = userType === 'student' ? 'studentId' : 'tutorId';
    const q = query(
      paymentsCollection,
      where(field, '==', userId),
      orderBy('createdAt', 'desc'),
      orderBy('status', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.slice(0, 5).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recent payments:', error);
    return [];
  }
};

export const getActiveStudents = async (tutorId: string) => {
  try {
    // Get bookings for this tutor
    const bookingsQuery = query(
      bookingsCollection,
      where('tutorId', '==', tutorId),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const studentIds = Array.from(
      new Set(bookingsSnapshot.docs.map(doc => doc.data().studentId))
    );

    // Get student details
    const students = await Promise.all(
      studentIds.map(async (studentId) => {
        const userDoc = await getDoc(doc(db, 'users', studentId));
        const studentData = userDoc.data();
        
        // Get upcoming sessions for this student
        const sessionsQuery = query(
          bookingsCollection,
          where('tutorId', '==', tutorId),
          where('studentId', '==', studentId),
          where('status', 'in', ['pending', 'confirmed'])
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        
        return {
          id: studentId,
          ...studentData,
          upcomingSessions: sessionsSnapshot.size,
        };
      })
    );

    return students;
  } catch (error) {
    console.error('Error getting active students:', error);
    return [];
  }
};

export const getUpcomingSessions = async (userId: string, userType: 'student' | 'tutor') => {
  try {
    const field = userType === 'student' ? 'studentId' : 'tutorId';
    const q = query(
      bookingsCollection,
      where(field, '==', userId),
      where('status', 'in', ['pending', 'confirmed']),
      orderBy('sessionDate', 'asc'),
      orderBy('sessionTime', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.slice(0, 10).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting upcoming sessions:', error);
    return [];
  }
};

export const getMonthlyEarnings = async (tutorId: string) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const q = query(
      bookingsCollection,
      where('tutorId', '==', tutorId),
      where('status', '==', 'completed'),
      where('completedAt', '>=', firstDay),
      where('completedAt', '<=', lastDay)
    );

    const querySnapshot = await getDocs(q);
    const totalEarnings = querySnapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (parseFloat(data.amount) || 0);
    }, 0);

    return totalEarnings;
  } catch (error) {
    console.error('Error getting monthly earnings:', error);
    return 0;
  }
};

export const getStudentProgress = async (studentId: string) => {
  try {
    const q = query(
      bookingsCollection,
      where('studentId', '==', studentId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group by month
    const monthlyData = bookings.reduce((acc, booking) => {
      if (booking.createdAt) {
        const date = booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = {
            month: date.toLocaleString('default', { month: 'short' }),
            sessions: 0,
            completed: 0,
            amount: 0
          };
        }
        
        acc[monthYear].sessions++;
        if (booking.status === 'completed') {
          acc[monthYear].completed++;
          acc[monthYear].amount += parseFloat(booking.amount) || 0;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData);
  } catch (error) {
    console.error('Error getting student progress:', error);
    return [];
  }
};

export const getTutorPerformance = async (tutorId: string) => {
  try {
    const q = query(
      bookingsCollection,
      where('tutorId', '==', tutorId),
      where('status', '==', 'completed')
    );

    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate performance metrics
    const totalSessions = bookings.length;
    const totalEarnings = bookings.reduce((sum, booking) => 
      sum + (parseFloat(booking.amount) || 0), 0
    );
    
    // Get student feedback
    const feedbackQuery = query(
      collection(db, 'reviews'),
      where('tutorId', '==', tutorId)
    );
    const feedbackSnapshot = await getDocs(feedbackQuery);
    const reviews = feedbackSnapshot.docs.map(doc => doc.data());
    
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
      : 0;

    const completionRate = totalSessions > 0
      ? Math.round((bookings.length / totalSessions) * 100)
      : 0;

    return {
      totalSessions,
      totalEarnings,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      completionRate,
      recentReviews: reviews.slice(0, 3),
    };
  } catch (error) {
    console.error('Error getting tutor performance:', error);
    return {
      totalSessions: 0,
      totalEarnings: 0,
      averageRating: 0,
      totalReviews: 0,
      completionRate: 0,
      recentReviews: [],
    };
  }
};

export const getStudentPendingBookings = async (studentId: string) => {
  try {
    const q = query(
      bookingsCollection,
      where('studentId', '==', studentId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting student pending bookings:', error);
    return [];
  }
};

/**
 * Update booking status (e.g., from pending to confirmed after payment)
 */
export const updateBookingStatus = async (bookingId: string, status: string, additionalData = {}) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
      ...additionalData
    });
    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

/**
 * Create a payment record
 */
export const createPayment = async (paymentData: any) => {
  try {
    const paymentRef = await addDoc(paymentsCollection, {
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return paymentRef.id;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

/**
 * Get payment by ID
 */
export const getPayment = async (paymentId: string) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnap = await getDoc(paymentRef);
    
    if (!paymentSnap.exists()) {
      return null;
    }
    
    return {
      id: paymentSnap.id,
      ...paymentSnap.data()
    };
  } catch (error) {
    console.error('Error getting payment:', error);
    return null;
  }
};

/**
 * Update payment status
 */
export const updatePayment = async (paymentId: string, paymentData: any) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      ...paymentData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

/**
 * Get student's payment history
 */
export const getStudentPayments = async (studentId: string) => {
  try {
    const q = query(
      paymentsCollection,
      where('userId', '==', studentId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting student payments:', error);
    return [];
  }
};

/**
 * Get tutor's payment history
 */
export const getTutorPayments = async (tutorId: string) => {
  try {
    const q = query(
      paymentsCollection,
      where('tutorId', '==', tutorId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tutor payments:', error);
    return [];
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId: string) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      return null;
    }
    
    return {
      id: bookingSnap.id,
      ...bookingSnap.data()
    };
  } catch (error) {
    console.error('Error getting booking:', error);
    return null;
  }
};

/**
 * Get student's tutors
 */
export const getStudentTutors = async (studentId: string) => {
  try {
    // Get all bookings for the student
    const bookingsQuery = query(
      bookingsCollection,
      where('studentId', '==', studentId),
      where('status', 'in', ['confirmed', 'completed'])
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const tutorIds = Array.from(
      new Set(bookingsSnapshot.docs.map(doc => doc.data().tutorId))
    );

    // Get tutor details
    const tutors = await Promise.all(
      tutorIds.map(async (tutorId) => {
        try {
          const tutorDoc = await getDoc(doc(db, 'tutors', tutorId));
          if (!tutorDoc.exists()) return null;
          
          const tutorData = tutorDoc.data();
          
          // Get booking stats for this tutor
          const tutorBookings = bookingsSnapshot.docs
            .filter(doc => doc.data().tutorId === tutorId)
            .map(doc => doc.data());
          
          const completedSessions = tutorBookings.filter(b => b.status === 'completed').length;
          const upcomingSessions = tutorBookings.filter(b => b.status === 'confirmed').length;
          
          return {
            id: tutorId,
            ...tutorData,
            completedSessions,
            upcomingSessions,
            totalSessions: tutorBookings.length,
            lastSession: tutorBookings[0]?.sessionDate || null,
          };
        } catch (error) {
          console.error(`Error fetching tutor ${tutorId}:`, error);
          return null;
        }
      })
    );

    return tutors.filter(tutor => tutor !== null);
  } catch (error) {
    console.error('Error getting student tutors:', error);
    return [];
  }
};

/**
 * Get messages between user and tutor/student
 */
export const getMessages = async (userId: string, otherUserId: string, userType: 'student' | 'tutor') => {
  try {
    const messagesRef = collection(db, 'messages');
    let q;
    
    if (userType === 'student') {
      q = query(
        messagesRef,
        where('studentId', '==', userId),
        where('tutorId', '==', otherUserId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        messagesRef,
        where('tutorId', '==', userId),
        where('studentId', '==', otherUserId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

/**
 * Send a message
 */
export const sendMessage = async (messageData: any) => {
  try {
    const messagesRef = collection(db, 'messages');
    const messageRef = await addDoc(messagesRef, {
      ...messageData,
      createdAt: serverTimestamp(),
      read: false,
    });
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (messageIds: string[]) => {
  try {
    const updatePromises = messageIds.map(async (messageId) => {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        read: true,
        readAt: serverTimestamp(),
      });
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Get user's conversations
 */
export const getUserConversations = async (userId: string, userType: 'student' | 'tutor') => {
  try {
    const field = userType === 'student' ? 'studentId' : 'tutorId';
    const otherField = userType === 'student' ? 'tutorId' : 'studentId';
    
    const q = query(
      collection(db, 'messages'),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const otherUserId = message[otherField];
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          otherUserId,
          lastMessage: message.message,
          lastMessageTime: message.createdAt,
          unreadCount: message.read === false ? 1 : 0,
          messages: [message]
        });
      } else {
        const conversation = conversationsMap.get(otherUserId);
        conversation.messages.push(message);
        if (message.read === false) {
          conversation.unreadCount++;
        }
        
        // Update last message if this message is newer
        if (message.createdAt > conversation.lastMessageTime) {
          conversation.lastMessage = message.message;
          conversation.lastMessageTime = message.createdAt;
        }
      }
    });

    // Get user details for each conversation
    const conversations = await Promise.all(
      Array.from(conversationsMap.values()).map(async (conversation) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', conversation.otherUserId));
          const userData = userDoc.data();
          
          return {
            ...conversation,
            otherUserName: userData?.firstName + ' ' + userData?.lastName,
            otherUserPhoto: userData?.profilePhoto,
          };
        } catch (error) {
          console.error(`Error fetching user ${conversation.otherUserId}:`, error);
          return conversation;
        }
      })
    );

    // Sort by last message time
    return conversations.sort((a, b) => {
      const timeA = a.lastMessageTime instanceof Timestamp 
        ? a.lastMessageTime.toMillis() 
        : new Date(a.lastMessageTime).getTime();
      const timeB = b.lastMessageTime instanceof Timestamp 
        ? b.lastMessageTime.toMillis() 
        : new Date(b.lastMessageTime).getTime();
      
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Create notification
 */
export const createNotification = async (notificationData: any) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const notificationRef = await addDoc(notificationsRef, {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp(),
    });
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get student's learning progress by subject
 */
export const getStudentSubjectProgress = async (studentId: string) => {
  try {
    const bookingsQuery = query(
      bookingsCollection,
      where('studentId', '==', studentId),
      where('status', '==', 'completed')
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group by subject
    const subjectProgress = bookings.reduce((acc, booking) => {
      const subject = booking.subject || 'General';
      if (!acc[subject]) {
        acc[subject] = {
          subject,
          totalSessions: 0,
          totalHours: 0,
          totalAmount: 0,
          lastSession: null,
        };
      }
      
      acc[subject].totalSessions++;
      acc[subject].totalHours += (booking.totalHours || 0);
      acc[subject].totalAmount += (parseFloat(booking.amount) || parseFloat(booking.totalAmount) || 0);
      
      const sessionDate = booking.sessionDate || booking.createdAt;
      if (sessionDate && (!acc[subject].lastSession || sessionDate > acc[subject].lastSession)) {
        acc[subject].lastSession = sessionDate;
      }
      
      return acc;
    }, {});

    return Object.values(subjectProgress);
  } catch (error) {
    console.error('Error getting student subject progress:', error);
    return [];
  }
};

/**
 * Get tutor's availability
 */
export const getTutorAvailability = async (tutorId: string) => {
  try {
    const tutorDoc = await getDoc(doc(db, 'tutors', tutorId));
    const tutorData = tutorDoc.data();
    
    if (!tutorData) {
      return [];
    }
    
    // Get tutor's scheduled sessions
    const bookingsQuery = query(
      bookingsCollection,
      where('tutorId', '==', tutorId),
      where('status', 'in', ['confirmed', 'active']),
      orderBy('sessionDate', 'asc')
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const scheduledSessions = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Return basic availability info
    return {
      teachingMode: tutorData.teachingMode || [],
      availability: tutorData.availability || [],
      scheduledSessions,
      hourlyRate: tutorData.hourlyRate || 0,
      isAvailable: tutorData.isAvailable || false,
    };
  } catch (error) {
    console.error('Error getting tutor availability:', error);
    return {
      teachingMode: [],
      availability: [],
      scheduledSessions: [],
      hourlyRate: 0,
      isAvailable: false,
    };
  }
};

/**
 * Update tutor availability
 */
export const updateTutorAvailability = async (tutorId: string, availabilityData: any) => {
  try {
    const tutorRef = doc(db, 'tutors', tutorId);
    await updateDoc(tutorRef, {
      ...availabilityData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating tutor availability:', error);
    throw error;
  }
};

/**
 * Get system analytics (for admin use)
 */
export const getSystemAnalytics = async () => {
  try {
    // Get total users
    const usersSnapshot = await getDocs(usersCollection);
    const totalUsers = usersSnapshot.size;
    
    // Get active tutors
    const tutorsQuery = query(
      tutorsCollection,
      where('status', '==', 'active'),
      where('isAvailable', '==', true)
    );
    const tutorsSnapshot = await getDocs(tutorsQuery);
    const activeTutors = tutorsSnapshot.size;
    
    // Get total bookings
    const bookingsSnapshot = await getDocs(bookingsCollection);
    const totalBookings = bookingsSnapshot.size;
    
    // Get completed bookings
    const completedBookingsQuery = query(
      bookingsCollection,
      where('status', '==', 'completed')
    );
    const completedBookingsSnapshot = await getDocs(completedBookingsQuery);
    const completedBookings = completedBookingsSnapshot.size;
    
    // Calculate total revenue
    let totalRevenue = 0;
    completedBookingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalRevenue += (parseFloat(data.amount) || 0);
    });
    
    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsersQuery = query(
      usersCollection,
      where('createdAt', '>=', thirtyDaysAgo),
      orderBy('createdAt', 'desc')
    );
    const recentUsersSnapshot = await getDocs(recentUsersQuery);
    const recentSignups = recentUsersSnapshot.size;
    
    return {
      totalUsers,
      activeTutors,
      totalBookings,
      completedBookings,
      totalRevenue,
      recentSignups,
      successRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
    };
  } catch (error) {
    console.error('Error getting system analytics:', error);
    return {
      totalUsers: 0,
      activeTutors: 0,
      totalBookings: 0,
      completedBookings: 0,
      totalRevenue: 0,
      recentSignups: 0,
      successRate: 0,
    };
  }
};