import { 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  collection, 
  orderBy,
  collectionGroup
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