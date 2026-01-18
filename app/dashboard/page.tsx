'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  TrendingUp, 
  Bell, 
  Settings, 
  LogOut,
  MessageSquare,
  FileText,
  CheckCircle,
  Sparkles,
  Target,
  TrendingDown,
  Eye,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Award,
  Heart,
  BarChart,
  HelpCircle,
  Home,
  CreditCard,
  Download,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Video,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Bookmark,
  Shield,
  Globe,
  Users2,
  PieChart,
  LineChart,
  FileEdit,
  Upload,
  ChevronRight,
  ChevronLeft,
  BookCheck,
  School,
  TargetIcon,
  Brain,
  Zap,
  Lightbulb,
  Check,
  X,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { 
  getTutorStats,
  getTutorBookings,
  getMonthlyEarnings,
  getTutorPerformance,
  getActiveStudents,
  getStudentStats,
  getUserBookings,
  getStudentPendingBookings,
  updateBookingStatus,
  createPayment,
  getPayment,
  updatePayment
} from "@/lib/firebase/dashboard"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { usePaystackPayment } from "@/hooks/usePaystack"

// Badge Component
function Badge({ variant, className, children, style }: any) {
  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`} style={style}>
      {children}
    </div>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const { user, userData, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [performance, setPerformance] = useState<any>(null);
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'tutors' | 'students' | 'earnings' | 'payments' | 'schedule' | 'resources' | 'performance' | 'support' | 'messages' | 'profile'>('overview');
  
  const { initializePayment } = usePaystackPayment();

  // Mock data for other sections
  const [availability, setAvailability] = useState([
    { day: 'Monday', time: '9:00 AM - 12:00 PM', status: 'active' },
    { day: 'Tuesday', time: '2:00 PM - 6:00 PM', status: 'active' },
    { day: 'Wednesday', time: '10:00 AM - 4:00 PM', status: 'active' },
    { day: 'Thursday', time: '1:00 PM - 5:00 PM', status: 'active' },
    { day: 'Friday', time: '9:00 AM - 1:00 PM', status: 'active' },
    { day: 'Saturday', time: '10:00 AM - 2:00 PM', status: 'inactive' },
    { day: 'Sunday', time: 'Not available', status: 'inactive' }
  ]);
  
  const [teachingResources] = useState([
    { title: 'Mathematics Curriculum Guide', type: 'PDF', size: '2.4 MB', downloads: 245 },
    { title: 'Physics Lab Worksheets', type: 'DOC', size: '1.8 MB', downloads: 189 },
    { title: 'Chemistry Experiment Videos', type: 'MP4', size: '45 MB', downloads: 312 },
    { title: 'Biology Diagrams Pack', type: 'ZIP', size: '15 MB', downloads: 156 },
    { title: 'Exam Preparation Tips', type: 'PDF', size: '3.2 MB', downloads: 421 }
  ]);
  
  const [performanceMetrics] = useState({
    studentRetention: 85,
    sessionGrowth: 42,
    ratingTrend: 4.8,
    engagementScore: 92
  });
  
  const [recentMessages] = useState([
    { student: 'John Doe', message: 'Hi, can we reschedule our session?', time: '2 hours ago', unread: true },
    { student: 'Sarah Johnson', message: 'Thank you for the great lesson!', time: '1 day ago', unread: false },
    { student: 'Michael Chen', message: 'I have a question about the homework', time: '2 days ago', unread: true }
  ]);
  
  const [myTutors] = useState([
    { name: 'Dr. Sarah Johnson', subject: 'Physics & Mathematics', rating: 4.9, sessions: 12, status: 'active' },
    { name: 'Mr. David Chen', subject: 'Chemistry & Biology', rating: 4.7, sessions: 8, status: 'active' },
    { name: 'Prof. Michael Brown', subject: 'English Literature', rating: 4.8, sessions: 5, status: 'active' }
  ]);

  useEffect(() => {
    if (user && userData) {
      loadDashboardData();
    }
  }, [user, userData]);

  useEffect(() => {
    if (user && userData && userData.role === 'student') {
      loadPendingBookings();
    }
  }, [user, userData]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (userData.role === 'tutor') {
        const [tutorStatsData, tutorBookings, earnings, performanceData, students] = await Promise.all([
          getTutorStats(user.uid),
          getTutorBookings(user.uid),
          getMonthlyEarnings(user.uid),
          getTutorPerformance(user.uid),
          getActiveStudents(user.uid)
        ]);
        
        setStats(tutorStatsData);
        setBookings(tutorBookings);
        setMonthlyEarnings(earnings);
        setPerformance(performanceData);
        setActiveStudents(students);
      } else {
        const [studentStatsData, studentBookings] = await Promise.all([
          getStudentStats(user.uid),
          getUserBookings(user.uid, 'student')
        ]);
        setStats(studentStatsData);
        setBookings(studentBookings);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingBookings = async () => {
    try {
      const pending = await getStudentPendingBookings(user.uid);
      setPendingBookings(pending);
    } catch (error) {
      console.error("Error loading pending bookings:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handlePayment = async (booking: any) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedBooking) return;

    setPaymentLoading(true);

    try {
      // Create payment reference
      const paymentReference = `PAY-${Date.now()}-${user.uid.slice(0, 8)}`;
      
      // Initialize Paystack payment
      initializePayment({
        email: user.email || userData.email,
        amount: selectedBooking.totalAmount * 100, // Convert to kobo
        reference: paymentReference,
        metadata: {
          userId: user.uid,
          bookingId: selectedBooking.id,
          tutorId: selectedBooking.tutorId,
          tutorName: selectedBooking.tutorName,
          studentName: `${userData.firstName} ${userData.lastName}`,
          subject: selectedBooking.subject,
          hours: selectedBooking.totalHours,
          hourlyRate: selectedBooking.hourlyRate,
          totalAmount: selectedBooking.totalAmount,
          bookingType: 'tutor_session',
        },
        callback: async (response: any) => {
          console.log("Payment response:", response);
          
          if (response.status === 'success' || response.message === 'Approved') {
            try {
              // Create payment record in database
              const paymentData = {
                bookingId: selectedBooking.id,
                userId: user.uid,
                userEmail: user.email || userData.email,
                tutorId: selectedBooking.tutorId,
                tutorName: selectedBooking.tutorName,
                studentName: `${userData.firstName} ${userData.lastName}`,
                amount: selectedBooking.totalAmount,
                reference: paymentReference,
                paystackReference: response.reference || response.trxref,
                status: 'completed',
                paymentMethod: 'paystack',
                metadata: {
                  subject: selectedBooking.subject,
                  hours: selectedBooking.totalHours,
                  hourlyRate: selectedBooking.hourlyRate,
                  totalAmount: selectedBooking.totalAmount,
                },
                paymentDate: new Date().toISOString(),
              };

              await createPayment(paymentData);

              // Update booking status
              await updateBookingStatus(selectedBooking.id, 'confirmed', {
                paymentStatus: 'completed',
                paymentReference: paymentReference,
                paidAt: new Date().toISOString(),
              });

              toast.success("Payment successful! Your booking is now confirmed.");
              
              // Update local state
              setBookings(prev => prev.map(b => 
                b.id === selectedBooking.id 
                  ? { ...b, status: 'confirmed', paymentStatus: 'completed' }
                  : b
              ));
              
              setPendingBookings(prev => prev.filter(b => b.id !== selectedBooking.id));

              // Close modal
              setShowPaymentModal(false);
              setSelectedBooking(null);
              
              // Refresh dashboard data
              loadDashboardData();

            } catch (error: any) {
              console.error('Error updating after payment:', error);
              toast.error(`Error updating booking: ${error.message}`);
            }
          } else {
            toast.error("Payment was not successful. Please try again.");
          }
          setPaymentLoading(false);
        },
        onClose: () => {
          console.log("Payment window closed");
          setPaymentLoading(false);
        },
      });

    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(`Payment error: ${error.message}`);
      setPaymentLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await updateBookingStatus(bookingId, 'cancelled');
      
      toast.success("Booking cancelled successfully");
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId));

    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(`Failed to cancel booking: ${error.message}`);
    }
  };

  const handleBookTutor = () => {
    window.location.href = '/tutors';
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string, timeString?: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return timeString ? `Invalid date at ${timeString}` : 'Invalid date';
      }
      const formattedDate = format(date, 'MMM d, yyyy');
      return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
    } catch (error) {
      console.error('Error formatting date:', error);
      return timeString ? `Date error at ${timeString}` : 'Date error';
    }
  };

  // Render content based on active tab and user role
  const renderContent = () => {
    if (userData.role === 'tutor') {
      return renderTutorContent();
    } else {
      return renderStudentContent();
    }
  };

  const renderTutorContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderTutorOverview();
      case 'bookings':
        return renderTutorBookings();
      case 'students':
        return renderTutorStudents();
      case 'earnings':
        return renderTutorEarnings();
      case 'schedule':
        return renderTutorSchedule();
      case 'resources':
        return renderTutorResources();
      case 'performance':
        return renderTutorPerformance();
      case 'messages':
        return renderMessages();
      case 'profile':
        return renderProfile();
      case 'support':
        return renderSupport();
      default:
        return renderTutorOverview();
    }
  };

  const renderStudentContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderStudentOverview();
      case 'bookings':
        return renderStudentBookings();
      case 'tutors':
        return renderStudentTutors();
      case 'payments':
        return renderStudentPayments();
      case 'messages':
        return renderMessages();
      case 'profile':
        return renderProfile();
      case 'support':
        return renderSupport();
      default:
        return renderStudentOverview();
    }
  };

  const renderTutorOverview = () => (
    <>
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#073045' }}>
              Welcome back, <span className="text-[#1d636c]">{userData?.firstName || "Tutor"}!</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening with your tutoring activities today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="gap-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
              <Target className="h-3 w-3" />
              {performance?.completionRate || 0}% Completion Rate
            </Badge>
            <Badge variant="outline" className="border-2" style={{ borderColor: '#1d636c', color: '#1d636c' }}>
              <Star className="h-3 w-3" />
              {stats?.rating?.toFixed(1) || '0.0'} Rating
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <Badge className="gap-1">
                <TrendingUp className="h-3 w-3" />
                +12%
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                ₦{stats?.totalEarnings?.toLocaleString() || '0'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#e6941f' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                <Users className="h-5 w-5 text-white" />
              </div>
              <Badge style={{ backgroundColor: '#073045', color: 'white' }}>
                {activeStudents.length || 0}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Students</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                {activeStudents.length || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {activeStudents.length > 0 ? 
                  `${activeStudents.filter(s => s.upcomingSessions > 0).length} with upcoming sessions` : 
                  "No active students"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#073045' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-3 w-3 mx-0.5 ${
                      star <= Math.floor(stats?.rating || 0) 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Rating</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                {stats?.rating?.toFixed(1) || '0.0'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Based on {stats?.totalReviews || 0} reviews
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <Award className="h-5 w-5 text-white" />
              </div>
              <Badge className="gap-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                <TrendingUp className="h-3 w-3" />
                +₦{(monthlyEarnings * 0.12).toLocaleString()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                ₦{monthlyEarnings?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-600 mt-1">Estimated earnings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings & Active Students */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#073045' }}>
              <Calendar className="h-5 w-5 mr-2" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Your latest tutoring sessions and upcoming bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {booking.studentName?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm" style={{ color: '#073045' }}>
                        {booking.studentName || "Student"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className="text-xs border"
                        style={{ borderColor: '#1d636c', color: '#1d636c' }}
                      >
                        {booking.subject || "Subject"}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {safeFormatDate(booking.sessionDate, booking.sessionTime)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge 
                      className={`text-xs ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-sm font-medium" style={{ color: '#073045' }}>
                      ₦{booking.amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: '#1d636c' }} />
                  <p className="text-gray-600">No bookings yet</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Update your profile to attract more students
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full border-2 hover:opacity-80 group"
                style={{ borderColor: '#1d636c', color: '#1d636c' }}
                onClick={() => setActiveTab('bookings')}
              >
                View All Bookings
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#073045' }}>
              <Users className="h-5 w-5 mr-2" />
              Active Students
            </CardTitle>
            <CardDescription>Students currently learning with you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeStudents.slice(0, 5).map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2" style={{ borderColor: '#1d636c' }}>
                      <AvatarImage src={student.profilePhoto || ""} />
                      <AvatarFallback className="text-white" style={{ backgroundColor: '#1d636c' }}>
                        {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#073045' }}>
                        {student.firstName} {student.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: '#e6941f', color: '#073045' }}
                        >
                          {student.upcomingSessions || 0} sessions
                        </Badge>
                        {student.studentClass && (
                          <span className="text-xs text-gray-600">
                            {student.studentClass}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-gray-100"
                    onClick={() => setActiveTab('students')}
                  >
                    <Eye className="h-4 w-4" style={{ color: '#073045' }} />
                  </Button>
                </div>
              ))}
              {activeStudents.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4" style={{ color: '#1d636c' }} />
                  <p className="text-gray-600">No active students</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Start by updating your availability
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full border-2 hover:opacity-80 group"
                style={{ borderColor: '#e6941f', color: '#e6941f' }}
                onClick={() => setActiveTab('students')}
              >
                View All Students
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
        <CardHeader>
          <CardTitle className="flex items-center" style={{ color: '#073045' }}>
            <BarChart className="h-5 w-5 mr-2" />
            Performance Overview
          </CardTitle>
          <CardDescription>Your tutoring performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4 p-4 border-2 rounded-lg" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#073045' }}>Completion Rate</p>
                  <p className="text-2xl font-bold">{performance?.completionRate || 0}%</p>
                </div>
              </div>
              <Progress value={performance?.completionRate || 0} className="h-2" />
            </div>

            <div className="space-y-4 p-4 border-2 rounded-lg" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#073045' }}>Average Rating</p>
                  <p className="text-2xl font-bold">{performance?.averageRating?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 mx-0.5 ${
                      star <= Math.floor(performance?.averageRating || 0) 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 p-4 border-2 rounded-lg" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#073045' }}>Total Sessions</p>
                  <p className="text-2xl font-bold">{stats?.completedSessions || 0}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {stats?.pendingSessions || 0} pending sessions
              </p>
            </div>

            <div className="space-y-4 p-4 border-2 rounded-lg" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#073045' }}>Hourly Rate</p>
                  <p className="text-2xl font-bold">₦{stats?.hourlyRate || '0'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {stats?.subjects?.slice(0, 2).join(', ') || 'No subjects'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
        <CardHeader>
          <CardTitle className="flex items-center" style={{ color: '#073045' }}>
            <Sparkles className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline"
              className="h-auto py-6 border-2 hover:border-[#1d636c] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={() => setActiveTab('schedule')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Schedule Session</p>
                  <p className="text-xs text-gray-600">Add new availability</p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto py-6 border-2 hover:border-[#e6941f] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={() => setActiveTab('schedule')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Update Availability</p>
                  <p className="text-xs text-gray-600">Set your teaching hours</p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto py-6 border-2 hover:border-[#073045] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={() => setActiveTab('resources')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Teaching Resources</p>
                  <p className="text-xs text-gray-600">Access materials</p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto py-6 border-2 hover:border-[#1d636c] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={() => setActiveTab('earnings')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">View Earnings</p>
                  <p className="text-xs text-gray-600">Check your income</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderStudentOverview = () => (
    <>
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#073045' }}>
              Welcome back, <span className="text-[#1d636c]">{userData?.firstName || "Student"}!</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Track your child's learning progress and upcoming sessions.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="gap-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
              <CheckCircle className="h-3 w-3" />
              {stats?.completionRate || 0}% Completion Rate
            </Badge>
            <Badge variant="outline" className="border-2" style={{ borderColor: '#1d636c', color: '#1d636c' }}>
              <Brain className="h-3 w-3" />
              Active Learning
            </Badge>
          </div>
        </div>
      </div>

      {/* Pending Payments Section */}
      {pendingBookings.length > 0 && (
        <Card className="border-2 mb-6" style={{ borderColor: '#e6941f' }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#073045' }}>
              <AlertCircle className="h-5 w-5 mr-2" style={{ color: '#e6941f' }} />
              Pending Payments ({pendingBookings.length})
            </CardTitle>
            <CardDescription>Complete payment to confirm your bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingBookings.slice(0, 3).map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 border-2 rounded-lg bg-yellow-50"
                  style={{ borderColor: '#e6941f' }}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border-2" style={{ borderColor: '#1d636c' }}>
                      <AvatarFallback className="text-white" style={{ backgroundColor: '#1d636c' }}>
                        {booking.tutorName?.charAt(0) || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold" style={{ color: '#073045' }}>
                        {booking.tutorName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge style={{ backgroundColor: '#1d636c', color: 'white' }}>
                          {booking.subject}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {booking.totalHours} hours
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-xl font-bold" style={{ color: '#073045' }}>
                      ₦{booking.totalAmount?.toLocaleString()}
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => handlePayment(booking)}
                      style={{ backgroundColor: '#e6941f', color: '#073045' }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
              {pendingBookings.length > 3 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('bookings')}
                    className="border-2"
                    style={{ borderColor: '#1d636c', color: '#1d636c' }}
                  >
                    View All Pending Payments ({pendingBookings.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <Badge className="gap-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                <TrendingUp className="h-3 w-3" />
                Active
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                {stats?.activeSessions || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Currently learning</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#e6941f' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                <Users className="h-5 w-5 text-white" />
              </div>
              <Badge style={{ backgroundColor: '#073045', color: 'white' }}>
                {stats?.totalTutors || 0}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tutors</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                {stats?.totalTutors || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Tutors hired</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#073045' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500 ml-1">+5%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                ₦{stats?.totalSpent?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-600 mt-1">On tutoring</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <Badge className="gap-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                <Target className="h-3 w-3" />
                On Track
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                {stats?.completionRate || 0}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Sessions completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings & My Tutors */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#073045' }}>
              <Calendar className="h-5 w-5 mr-2" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Recent tutoring sessions booked for your child</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {booking.tutorName?.charAt(0) || "T"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm" style={{ color: '#073045' }}>
                        {booking.tutorName || "Tutor"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className="text-xs border"
                        style={{ borderColor: '#1d636c', color: '#1d636c' }}
                      >
                        {booking.subject || "Subject"}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {safeFormatDate(booking.sessionDate, booking.sessionTime)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge 
                      className={`text-xs ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-sm font-medium" style={{ color: '#073045' }}>
                      ₦{booking.amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: '#1d636c' }} />
                  <p className="text-gray-600">No bookings yet</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Start by finding a tutor for your child
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full border-2 hover:opacity-80 group"
                style={{ borderColor: '#1d636c', color: '#1d636c' }}
                onClick={() => setActiveTab('bookings')}
              >
                View All Bookings
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#073045' }}>
              <Users className="h-5 w-5 mr-2" />
              My Tutors
            </CardTitle>
            <CardDescription>Tutors currently teaching your child</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTutors.slice(0, 5).map((tutor, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2" style={{ borderColor: '#1d636c' }}>
                      <AvatarFallback className="text-white" style={{ backgroundColor: '#1d636c' }}>
                        {tutor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#073045' }}>
                        {tutor.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: '#e6941f', color: '#073045' }}
                        >
                          {tutor.subject}
                        </Badge>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs">{tutor.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {tutor.sessions} sessions
                  </Badge>
                </div>
              ))}
              {myTutors.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4" style={{ color: '#1d636c' }} />
                  <p className="text-gray-600">No tutors yet</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Find a tutor to start learning
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full border-2 hover:opacity-80 group"
                style={{ borderColor: '#e6941f', color: '#e6941f' }}
                onClick={() => setActiveTab('tutors')}
              >
                View All Tutors
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
        <CardHeader>
          <CardTitle className="flex items-center" style={{ color: '#073045' }}>
            <TrendingUp className="h-5 w-5 mr-2" />
            Learning Progress
          </CardTitle>
          <CardDescription>Track your child's academic improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4 p-4 border-2 rounded-lg" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#073045' }}>Attendance Rate</p>
                  <p className="text-2xl font-bold">{stats?.attendanceRate || 95}%</p>
                </div>
              </div>
              <Progress value={stats?.attendanceRate || 95} className="h-2" />
            </div>

            <div className="space-y-4 p-4 border-2 rounded-lg" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#073045' }}>Homework Completion</p>
                  <p className="text-2xl font-bold">{stats?.homeworkCompletion || 88}%</p>
                </div>
              </div>
              <Progress value={stats?.homeworkCompletion || 88} className="h-2" />
            </div>

            <div className="space-y-4 p-4 border-2 rounded-lg" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                  <TargetIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#073045' }}>Grade Improvement</p>
                  <p className="text-2xl font-bold">+{stats?.gradeImprovement || 15}%</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Average score increase</p>
            </div>

            <div className="space-y-4 p-4 border-2 rounded-lg" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                  <BookCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#073045' }}>Lessons Completed</p>
                  <p className="text-2xl font-bold">{stats?.lessonsCompleted || 24}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {stats?.subjects?.slice(0, 2).join(', ') || 'Mathematics, Science'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
        <CardHeader>
          <CardTitle className="flex items-center" style={{ color: '#073045' }}>
            <Sparkles className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline"
              className="h-auto py-6 border-2 hover:border-[#1d636c] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={handleBookTutor}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Find New Tutor</p>
                  <p className="text-xs text-gray-600">Browse tutors</p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto py-6 border-2 hover:border-[#e6941f] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={handleBookTutor}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Book New Session</p>
                  <p className="text-xs text-gray-600">Schedule lesson</p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto py-6 border-2 hover:border-[#073045] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={() => setActiveTab('payments')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Make Payment</p>
                  <p className="text-xs text-gray-600">Pay for sessions</p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto py-6 border-2 hover:border-[#1d636c] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={() => setActiveTab('messages')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Contact Tutors</p>
                  <p className="text-xs text-gray-600">Send message</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderStudentBookings = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Bookings</h1>
          <p className="text-gray-600">Manage your child's tutoring sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            style={{ backgroundColor: '#1d636c', color: 'white' }}
            onClick={handleBookTutor}
          >
            <Plus className="h-4 w-4 mr-2" />
            Book New Session
          </Button>
        </div>
      </div>

      {/* Pending Payments Section */}
      {pendingBookings.length > 0 && (
        <Card className="border-2 mb-8" style={{ borderColor: '#e6941f' }}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#073045' }}>
              <AlertCircle className="h-5 w-5 mr-2" style={{ color: '#e6941f' }} />
              Pending Payments ({pendingBookings.length})
            </CardTitle>
            <CardDescription>Complete payment to confirm these bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 border-2 rounded-lg bg-yellow-50"
                  style={{ borderColor: '#e6941f' }}
                >
                  <div className="flex items-start md:items-center space-x-4">
                    <Avatar className="h-14 w-14 border-2" style={{ borderColor: '#1d636c' }}>
                      <AvatarFallback className="text-lg" style={{ backgroundColor: '#1d636c', color: 'white' }}>
                        {booking.tutorName?.charAt(0) || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg" style={{ color: '#073045' }}>
                        {booking.tutorName}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge style={{ backgroundColor: '#1d636c', color: 'white' }}>
                          {booking.subject}
                        </Badge>
                        <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                          {booking.totalHours} hours
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Hourly Rate: ₦{booking.hourlyRate?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:text-right space-y-3">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                        ₦{booking.totalAmount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.totalHours} hours × ₦{booking.hourlyRate?.toLocaleString()}/hour
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handlePayment(booking)}
                        style={{ backgroundColor: '#e6941f', color: '#073045' }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => cancelBooking(booking.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {/* Confirmed Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" style={{ color: '#10b981' }} />
              Confirmed Sessions
            </CardTitle>
            <CardDescription>Upcoming and ongoing tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings
                .filter(b => b.status === 'confirmed' || b.status === 'active')
                .slice(0, 5)
                .map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{booking.tutorName}</p>
                      <p className="text-sm text-gray-600">{booking.subject}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {booking.sessionDate && (
                          <span className="text-sm">{safeFormatDate(booking.sessionDate)}</span>
                        )}
                        {booking.sessionTime && (
                          <span className="text-sm">{booking.sessionTime}</span>
                        )}
                        <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                          ₦{booking.amount?.toLocaleString() || booking.totalAmount?.toLocaleString()}
                        </Badge>
                        {booking.totalHours && (
                          <span className="text-sm text-gray-600">
                            {booking.totalHours} hours
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Join
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {bookings.filter(b => b.status === 'confirmed' || b.status === 'active').length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: '#1d636c' }} />
                  <p className="text-gray-600">No confirmed sessions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookCheck className="h-5 w-5 mr-2" style={{ color: '#1d636c' }} />
              Completed Sessions
            </CardTitle>
            <CardDescription>Past completed tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings
                .filter(b => b.status === 'completed')
                .slice(0, 5)
                .map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{booking.tutorName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{booking.tutorName}</p>
                      <p className="text-sm text-gray-600">{booking.subject}</p>
                      {booking.sessionDate && (
                        <p className="text-xs text-gray-500">
                          Completed on {safeFormatDate(booking.sessionDate)}
                        </p>
                      )}
                      {booking.totalHours && (
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.totalHours} hours completed
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{booking.amount?.toLocaleString() || booking.totalAmount?.toLocaleString()}</p>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
              ))}
              {bookings.filter(b => b.status === 'completed').length === 0 && (
                <div className="text-center py-8">
                  <BookCheck className="h-12 w-12 mx-auto mb-4" style={{ color: '#1d636c' }} />
                  <p className="text-gray-600">No completed sessions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStudentPayments = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Payments</h1>
          <p className="text-gray-600">Manage your tutoring payments</p>
        </div>
        <Button 
          size="sm"
          style={{ backgroundColor: '#1d636c', color: 'white' }}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                Updated
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                ₦{stats?.totalSpent?.toLocaleString() || '0'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                This Month
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                ₦{(stats?.totalSpent * 0.3 || 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                <Clock className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Pending
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Payments</p>
              <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                ₦{pendingBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {pendingBookings.length} pending bookings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent payments for tutoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings
              .filter(b => b.status === 'completed' || b.status === 'confirmed')
              .slice(0, 10)
              .map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${booking.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <DollarSign className={`h-5 w-5 ${booking.status === 'completed' ? 'text-green-800' : 'text-blue-800'}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{booking.tutorName}</p>
                    <p className="text-sm text-gray-600">{booking.subject}</p>
                    {booking.sessionDate && (
                      <p className="text-xs text-gray-500">
                        {safeFormatDate(booking.sessionDate)}
                      </p>
                    )}
                    {booking.totalHours && (
                      <p className="text-xs text-gray-500">
                        {booking.totalHours} hours
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₦{booking.amount?.toLocaleString() || booking.totalAmount?.toLocaleString()}</p>
                  <Badge className={booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {booking.status === 'completed' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Payment Modal
  const PaymentModal = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#073045' }}>Complete Payment</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12 border-2" style={{ borderColor: '#1d636c' }}>
                    <AvatarFallback className="text-white" style={{ backgroundColor: '#1d636c' }}>
                      {selectedBooking.tutorName?.charAt(0) || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold" style={{ color: '#073045' }}>
                      {selectedBooking.tutorName}
                    </p>
                    <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                      {selectedBooking.subject}
                    </Badge>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3 p-4 border-2 rounded-lg" style={{ borderColor: '#e5e7eb' }}>
                  <h4 className="font-semibold" style={{ color: '#073045' }}>Cost Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate:</span>
                      <span className="font-medium">₦{selectedBooking.hourlyRate?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours:</span>
                      <span className="font-medium">{selectedBooking.totalHours} hours</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold" style={{ color: '#073045' }}>Total Amount:</span>
                      <span className="text-xl font-bold" style={{ color: '#e6941f' }}>
                        ₦{selectedBooking.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <h4 className="font-semibold" style={{ color: '#073045' }}>Payment Method</h4>
                  <div className="grid gap-3">
                    <button 
                      onClick={processPayment}
                      disabled={paymentLoading}
                      className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-[#1d636c] transition-colors"
                      style={{ borderColor: '#e5e7eb' }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-800" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">Paystack</p>
                          <p className="text-sm text-gray-600">Card, Bank Transfer, USSD</p>
                        </div>
                      </div>
                      {paymentLoading && (
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#1d636c' }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Security Note */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 flex-shrink-0" style={{ color: '#1d636c' }} />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Secure Payment</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your payment is processed securely through Paystack. We never store your card details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-2"
                  style={{ borderColor: '#1d636c', color: '#1d636c' }}
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentLoading}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 hover:opacity-90"
                  onClick={processPayment}
                  disabled={paymentLoading}
                  style={{ backgroundColor: '#e6941f', color: '#073045' }}
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ₦{selectedBooking.totalAmount?.toLocaleString()}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
  
  

  

 

  const renderTutorBookings = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Bookings</h1>
          <p className="text-gray-600">Manage your tutoring sessions and appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            size="sm"
            style={{ backgroundColor: '#1d636c', color: 'white' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your confirmed tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'confirmed').slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{booking.studentName}</p>
                      <p className="text-sm text-gray-600">{booking.subject}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm">{safeFormatDate(booking.sessionDate)}</span>
                        <span className="text-sm">{booking.sessionTime}</span>
                        <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                          ₦{booking.amount?.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>Past completed sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'completed').slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{booking.studentName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{booking.studentName}</p>
                      <p className="text-sm text-gray-600">{booking.subject}</p>
                      <p className="text-xs text-gray-500">
                        Completed on {safeFormatDate(booking.sessionDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{booking.amount?.toLocaleString()}</p>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );



  const renderTutorStudents = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Students</h1>
          <p className="text-gray-600">Manage your students and their progress</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeStudents.map((student) => (
              <Card key={student.id} className="border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-20 w-20 border-4" style={{ borderColor: '#1d636c' }}>
                      <AvatarImage src={student.profilePhoto || ""} />
                      <AvatarFallback className="text-xl">
                        {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{student.firstName} {student.lastName}</h3>
                      <p className="text-gray-600">{student.studentClass || 'Grade Level'}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                          {student.upcomingSessions || 0} sessions
                        </Badge>
                        <Badge variant="outline">
                          {student.subject || 'Subject'}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        style={{ borderColor: '#1d636c', color: '#1d636c' }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setActiveTab('schedule')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentTutors = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>My Tutors</h1>
          <p className="text-gray-600">Tutors teaching your child</p>
        </div>
        <Button 
          size="sm"
          style={{ backgroundColor: '#1d636c', color: 'white' }}
          onClick={() => window.location.href = '/tutors'}
        >
          <Plus className="h-4 w-4 mr-2" />
          Find New Tutor
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myTutors.map((tutor, index) => (
              <Card key={index} className="border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-20 w-20 border-4" style={{ borderColor: '#1d636c' }}>
                      <AvatarFallback className="text-xl">
                        {tutor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{tutor.name}</h3>
                      <p className="text-gray-600">{tutor.subject}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                          <Star className="h-3 w-3 mr-1" />
                          {tutor.rating}
                        </Badge>
                        <Badge variant="outline">
                          {tutor.sessions} sessions
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        style={{ borderColor: '#1d636c', color: '#1d636c' }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setActiveTab('bookings')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTutorEarnings = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Earnings</h1>
          <p className="text-gray-600">Track your income and payments</p>
        </div>
        <Button 
          size="sm"
          style={{ backgroundColor: '#1d636c', color: 'white' }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Total Earnings</p>
            <p className="text-2xl font-bold">₦{stats?.totalEarnings?.toLocaleString() || '0'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                This Month
              </Badge>
            </div>
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold">₦{monthlyEarnings?.toLocaleString() || '0'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Pending
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Pending Payments</p>
            <p className="text-2xl font-bold">₦{(monthlyEarnings * 0.2).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <Download className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                Available
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Available for Withdrawal</p>
            <p className="text-2xl font-bold">₦{(monthlyEarnings * 0.8).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent payments and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.slice(0, 10).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${booking.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <DollarSign className={`h-5 w-5 ${booking.status === 'completed' ? 'text-green-800' : 'text-yellow-800'}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{booking.studentName}</p>
                    <p className="text-sm text-gray-600">{booking.subject} • {safeFormatDate(booking.sessionDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₦{booking.amount?.toLocaleString()}</p>
                  <Badge className={booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

 

  const renderTutorSchedule = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Schedule</h1>
          <p className="text-gray-600">Manage your availability and sessions</p>
        </div>
        <Button 
          size="sm"
          style={{ backgroundColor: '#1d636c', color: 'white' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Availability
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Availability</CardTitle>
            <CardDescription>Set your regular teaching hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availability.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${slot.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="font-medium">{slot.day}</p>
                      <p className="text-sm text-gray-600">{slot.time}</p>
                    </div>
                  </div>
                  <Badge className={slot.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {slot.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'confirmed').slice(0, 5).map((booking) => (
                <div key={booking.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{booking.studentName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{booking.studentName}</span>
                    </div>
                    <Badge>{booking.subject}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {safeFormatDate(booking.sessionDate, booking.sessionTime)}
                    </span>
                    <span className="font-medium">₦{booking.amount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTutorResources = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Teaching Resources</h1>
          <p className="text-gray-600">Access educational materials and tools</p>
        </div>
        <Button 
          variant="outline"
          size="sm"
        >
          <UploadIcon className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachingResources.map((resource, index) => (
              <Card key={index} className="border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <Badge>{resource.type}</Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{resource.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{resource.size}</span>
                    <span>{resource.downloads} downloads</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    style={{ borderColor: '#1d636c', color: '#1d636c' }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTutorPerformance = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Performance Analytics</h1>
          <p className="text-gray-600">Track your tutoring performance and growth</p>
        </div>
        <Button 
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <Users2 className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Student Retention</p>
            <p className="text-2xl font-bold">{performanceMetrics.studentRetention}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                +42%
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Session Growth</p>
            <p className="text-2xl font-bold">{performanceMetrics.sessionGrowth}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                <Star className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                {performanceMetrics.ratingTrend}/5
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Rating Trend</p>
            <p className="text-2xl font-bold">{performanceMetrics.ratingTrend}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                Excellent
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Engagement Score</p>
            <p className="text-2xl font-bold">{performanceMetrics.engagementScore}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Monthly performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Session Completion Rate</p>
                <p className="text-sm text-gray-600">Percentage of completed sessions</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{performance?.completionRate || 0}%</p>
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Average Session Rating</p>
                <p className="text-sm text-gray-600">Student feedback score</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{performance?.averageRating?.toFixed(1) || '0.0'}</p>
                <div className="flex items-center justify-end">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 mx-0.5 ${
                        star <= Math.floor(performance?.averageRating || 0) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Messages</h1>
          <p className="text-gray-600">Communicate with your {userData.role === 'tutor' ? 'students' : 'tutors'}</p>
        </div>
        <Button 
          size="sm"
          style={{ backgroundColor: '#1d636c', color: 'white' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${message.unread ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{message.student}</p>
                    {message.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>Select a conversation to start chatting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-96">
              <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-gray-600 text-center">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Profile Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        <Button 
          size="sm"
          style={{ backgroundColor: '#1d636c', color: 'white' }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-32 w-32 border-4" style={{ borderColor: '#1d636c' }}>
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="text-2xl">
                  {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{userData?.firstName} {userData?.lastName}</h3>
                <p className="text-gray-600">
                  {userData.role === 'tutor' ? 'Verified Tutor' : 'Parent/Student'}
                </p>
                <div className="mt-2">
                  <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                    {userData?.role === 'tutor' ? 'Premium Tutor' : 'Active Account'}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                style={{ borderColor: '#1d636c', color: '#1d636c' }}
              >
                Change Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">First Name</p>
                  <p className="text-lg">{userData?.firstName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Name</p>
                  <p className="text-lg">{userData?.lastName || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg">{user?.email || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Phone Number</p>
                <p className="text-lg">{userData?.phoneNumber || 'Not provided'}</p>
              </div>
              
              {userData.role === 'tutor' && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Subjects</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stats?.subjects?.map((subject: string, index: number) => (
                      <Badge key={index} style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                        {subject}
                      </Badge>
                    )) || <p className="text-gray-600">No subjects listed</p>}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-4">Security</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#1d636c' }}>
          <HelpCircle className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#073045' }}>Help & Support</h1>
        <p className="text-gray-600 text-lg">
          We're here to help you succeed. Get assistance with any issues or questions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 hover:border-[#1d636c] transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full" style={{ backgroundColor: '#e6941f' }}>
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Live Chat Support</h3>
                <p className="text-gray-600">Chat with our support team in real-time for immediate assistance.</p>
              </div>
              <Button 
                className="w-full"
                style={{ backgroundColor: '#1d636c', color: 'white' }}
              >
                Start Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-[#e6941f] transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full" style={{ backgroundColor: '#073045' }}>
                <Mail className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Email Support</h3>
                <p className="text-gray-600">Send us an email and we'll respond within 24 hours.</p>
              </div>
              <Button 
                variant="outline"
                className="w-full"
                style={{ borderColor: '#e6941f', color: '#e6941f' }}
              >
                Email Us
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-[#073045] transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full" style={{ backgroundColor: '#1d636c' }}>
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Help Center</h3>
                <p className="text-gray-600">Browse our comprehensive knowledge base and FAQs.</p>
              </div>
              <Button 
                variant="outline"
                className="w-full"
                style={{ borderColor: '#073045', color: '#073045' }}
              >
                Visit Help Center
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">How do I {userData.role === 'tutor' ? 'update my availability' : 'book a session'}?</h3>
              <p className="text-gray-600">
                {userData.role === 'tutor' 
                  ? 'Go to the Schedule section and click "Add Availability" to set your teaching hours.'
                  : 'Find a tutor from the Tutors page, select a time slot, and complete the booking process.'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">When do {userData.role === 'tutor' ? 'I get paid' : 'payments process'}?</h3>
              <p className="text-gray-600">
                {userData.role === 'tutor'
                  ? 'Payments are processed weekly on Fridays for all completed sessions.'
                  : 'Payments are processed immediately upon booking confirmation. You can view payment history in the Payments section.'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">How can I {userData.role === 'tutor' ? 'improve my rating' : 'track progress'}?</h3>
              <p className="text-gray-600">
                {userData.role === 'tutor'
                  ? 'Be punctual, prepared, and provide quality instruction. Request feedback after sessions.'
                  : 'Monitor learning progress in the Overview section and review session feedback from tutors.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1d636c' }}>
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Loading Dashboard</h3>
          <p className="text-gray-600">Preparing your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ color: '#073045' }}>Edumentor</span>
              <Badge className="hidden md:inline-flex" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                <Sparkles className="inline h-3 w-3 mr-1" />
                {userData?.role === 'tutor' ? 'Tutor Dashboard' : 'Student Dashboard'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" style={{ color: '#073045' }} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingBookings.length}
              </span>
            </button>
            
            <div className="hidden md:flex items-center space-x-3">
              <Avatar className="h-9 w-9 border-2" style={{ borderColor: '#1d636c' }}>
                <AvatarImage src={user?.photoURL || ""} alt={userData?.firstName || "User"} />
                <AvatarFallback className="text-white" style={{ backgroundColor: '#1d636c' }}>
                  {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold" style={{ color: '#073045' }}>
                  {userData?.firstName} {userData?.lastName}
                </p>
                <p className="text-xs text-gray-600">
                  {userData?.role === 'tutor' ? 'Verified Tutor' : 'Parent/Student'}
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="hover:opacity-80"
              style={{ color: '#073045' }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:flex lg:flex-col lg:inset-0`}>
          <div className="flex-1 p-6 overflow-y-auto">
            {/* User Profile */}
            <div className="flex items-center space-x-3 mb-8 p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
              <Avatar className="h-12 w-12 border-2" style={{ borderColor: '#1d636c' }}>
                <AvatarImage src={user?.photoURL || ""} alt={userData?.firstName || "User"} />
                <AvatarFallback className="text-white" style={{ backgroundColor: '#1d636c' }}>
                  {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#073045' }}>
                  {userData?.firstName} {userData?.lastName}
                </p>
                <div className="flex items-center">
                  <Badge className="mt-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                    <CheckCircle className="inline h-3 w-3 mr-1" />
                    {userData?.role === 'tutor' ? 'Verified' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#1d636c' }}>Dashboard</h3>
                <nav className="space-y-1">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                      activeTab === 'overview' 
                        ? 'bg-[#1d636c] text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">Overview</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('bookings')}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                      activeTab === 'bookings' 
                        ? 'bg-[#1d636c] text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">Bookings</span>
                    {userData.role === 'student' && pendingBookings.length > 0 && (
                      <Badge className="ml-auto" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                        {pendingBookings.length}
                      </Badge>
                    )}
                  </button>
                  
                  {userData.role === 'tutor' ? (
                    <>
                      <button 
                        onClick={() => setActiveTab('students')}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                          activeTab === 'students' 
                            ? 'bg-[#1d636c] text-white' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Students</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('earnings')}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                          activeTab === 'earnings' 
                            ? 'bg-[#1d636c] text-white' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <DollarSign className="h-5 w-5" />
                        <span className="font-medium">Earnings</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setActiveTab('tutors')}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                          activeTab === 'tutors' 
                            ? 'bg-[#1d636c] text-white' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Users className="h-5 w-5" />
                        <span className="font-medium">My Tutors</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('payments')}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                          activeTab === 'payments' 
                            ? 'bg-[#1d636c] text-white' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <DollarSign className="h-5 w-5" />
                        <span className="font-medium">Payments</span>
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                      activeTab === 'messages' 
                        ? 'bg-[#1d636c] text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">Messages</span>
                  </button>
                </nav>
              </div>

              {userData.role === 'tutor' && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#1d636c' }}>Resources</h3>
                  <nav className="space-y-1">
                    <button 
                      onClick={() => setActiveTab('schedule')}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                        activeTab === 'schedule' 
                          ? 'bg-[#1d636c] text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">Schedule</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('resources')}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                        activeTab === 'resources' 
                          ? 'bg-[#1d636c] text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">Resources</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('performance')}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                        activeTab === 'performance' 
                          ? 'bg-[#1d636c] text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <BarChart className="h-5 w-5" />
                      <span className="font-medium">Performance</span>
                    </button>
                  </nav>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#1d636c' }}>Account</h3>
                <nav className="space-y-1">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                      activeTab === 'profile' 
                        ? 'bg-[#1d636c] text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Profile Settings</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('support')}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                      activeTab === 'support' 
                        ? 'bg-[#1d636c] text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="font-medium">Help & Support</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: '#073045' }}>
                  {userData.role === 'tutor' ? 'This Month' : 'Active Status'}
                </span>
                <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                  {userData.role === 'tutor' 
                    ? `₦${monthlyEarnings?.toLocaleString() || '0'}`
                    : `${bookings.length} Bookings`}
                </Badge>
              </div>
              <Progress 
                value={userData.role === 'tutor' ? 75 : 90} 
                className="h-2 mb-2" 
                style={{ backgroundColor: '#e5e7eb' }} 
              />
              <p className="text-xs text-gray-600">
                {userData.role === 'tutor'
                  ? `${bookings.length} bookings • ${activeStudents.length} active students`
                  : `${bookings.filter(b => b.status === 'confirmed').length} upcoming • ${bookings.filter(b => b.status === 'completed').length} completed`}
              </p>
            </div>
          </div>
          
          {/* Mobile close button */}
          {sidebarOpen && (
            <div className="lg:hidden p-4 border-t">
              <Button 
                onClick={() => setSidebarOpen(false)}
                className="w-full"
                variant="outline"
              >
                Close Menu
              </Button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="space-y-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
}

// Upload icon component
const UploadIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);