'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Star,
  MapPin,
  Clock,
  Users,
  Award,
  Shield,
  CheckCircle,
  GraduationCap,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  BookMarked,
  FileText,
  TrendingUp,
  Loader2,
  ArrowLeft,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Target,
  Heart,
  ChevronDown,
  X
} from "lucide-react";
import {
  getTutorById,
  createBooking,
  getTutorReviews,
  createReview,
} from "@/lib/firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Badge Component
function BadgeComponent({ variant, className, children, style }: any) {
  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`} style={style}>
      {children}
    </div>
  );
}

interface Tutor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  qualification: string;
  university: string;
  subjects: string[];
  packages: string[];
  location: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  experience: string;
  bio: string;
  isAvailable: boolean;
  verified: boolean;
  totalSessions: number;
  totalStudents: number;
  teachingMode: string[];
  status: string;
  educationInfo?: {
    degree: string;
    university: string;
    graduationYear: string;
    cgpa: string;
    discipline: string;
  };
  nyscInfo?: {
    deploymentNumber: string;
    stateOfDeployment: string;
    ppa: string;
    batchYear: string;
  };
  personalInfo?: {
    dateOfBirth: string;
    gender: string;
    stateOfOrigin: string;
    address: string;
  };
  documents?: {
    certificate?: { url: string };
  };
  approvedAt?: string;
  createdAt?: string;
}

interface Review {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
  bookingId?: string;
  subject?: string;
}

interface ReviewForm {
  rating: number;
  comment: string;
}

export default function TutorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, userData } = useAuth();
  
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 5,
    comment: "",
  });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      loadTutorProfile();
      loadReviews();
    }
  }, [id]);

  const loadTutorProfile = async () => {
    setLoading(true);
    try {
      const tutorData = await getTutorById(id as string);
      if (!tutorData) {
        toast.error("Tutor not found");
        router.push("/tutors");
        return;
      }
      setTutor(tutorData as Tutor);
    } catch (error) {
      console.error("Error loading tutor:", error);
      toast.error("Failed to load tutor profile");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const reviewsData = await getTutorReviews(id as string);
      setReviews(reviewsData as Review[]);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  const handleBookTutor = async () => {
    if (!user) {
      toast.error("Please login to book a tutor");
      router.push("/login");
      return;
    }

    if (!userData) {
      toast.error("Please complete your profile first");
      router.push("/dashboard/profile");
      return;
    }

    if (userData.role !== "student") {
      toast.error("Only students/parents can book tutors");
      return;
    }

    if (!tutor?.isAvailable) {
      toast.error("This tutor is not currently available");
      return;
    }

    setBookingLoading(true);
    try {
      await createBooking({
        tutorId: tutor!.id,
        tutorName: `${tutor!.firstName} ${tutor!.lastName}`,
        studentId: user.uid,
        studentName: `${userData.firstName} ${userData.lastName}`,
        studentEmail: user.email,
        studentPhone: userData.phone,
        status: "pending",
        createdAt: new Date().toISOString(),
        subject: tutor!.subjects[0] || "General",
        package: tutor!.packages[0] || "General",
        hourlyRate: tutor!.hourlyRate,
        location: tutor!.location,
        teachingMode: tutor!.teachingMode?.[0] || "in-person",
      });

      toast.success("Interest indicated successfully! The tutor will contact you soon.");
      setTimeout(() => {
        router.push("/dashboard/bookings");
      }, 2000);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(`Failed to indicate interest: ${error.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !userData) {
      toast.error("Please login to submit a review");
      return;
    }

    if (userData.role !== "student") {
      toast.error("Only students can submit reviews");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    setReviewLoading(true);
    try {
      await createReview({
        tutorId: tutor!.id,
        studentId: user.uid,
        studentName: `${userData.firstName} ${userData.lastName}`,
        studentPhoto: userData.profilePhoto,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: new Date().toISOString(),
      });

      toast.success("Review submitted successfully!");
      setReviewForm({ rating: 5, comment: "" });
      await loadReviews();
      await loadTutorProfile(); // Refresh tutor rating
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error(`Failed to submit review: ${error.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case "5+ years":
        return "bg-purple-100 text-purple-800";
      case "3-5 years":
        return "bg-blue-100 text-blue-800";
      case "1-2 years":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTeachingModeBadge = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "online":
        return <BadgeComponent variant="secondary" style={{ backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' }}>Online</BadgeComponent>;
      case "in-person":
      case "physical":
        return <BadgeComponent variant="secondary" style={{ backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' }}>In-person</BadgeComponent>;
      case "both":
        return <BadgeComponent variant="secondary" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', borderColor: '#d8b4fe' }}>Both</BadgeComponent>;
      default:
        return <BadgeComponent variant="secondary">{mode}</BadgeComponent>;
    }
  };

  const calculateRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[5 - review.rating]++;
      }
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#1d636c' }} />
          <p className="text-gray-600">Loading tutor profile...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4" style={{ color: '#1d636c' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#073045' }}>Tutor not found</h3>
          <p className="text-gray-600 mb-4">The tutor you're looking for doesn't exist.</p>
          <Link href="/tutors">
            <Button style={{ backgroundColor: '#1d636c', color: 'white' }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tutors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const ratingDistribution = calculateRatingDistribution();
  const isStudent = userData?.role === "student";
  const canBook = isStudent && tutor.isAvailable;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
          <div className="flex items-center space-x-2">
            <Image 
              src="/edumentor-logo.png"
              alt="Edumentor Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold" style={{ color: '#073045' }}>Edumentor</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/tutors" className="text-sm font-medium hover:opacity-80 transition-colors" style={{ color: '#073045' }}>
              Find Tutors
            </Link>
            <Link href="/become-tutor" className="text-sm font-medium hover:opacity-80 transition-colors" style={{ color: '#073045' }}>
              Become a Tutor
            </Link>
            <Link href="/about" className="text-sm font-medium hover:opacity-80 transition-colors" style={{ color: '#073045' }}>
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/tutors">
              <Button variant="ghost" size="sm" className="hover:opacity-80" style={{ color: '#073045' }}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tutors
              </Button>
            </Link>
            {user ? (
              userData?.role === 'tutor' || userData?.role === 'tutor_applicant' ? (
                <Link href="/tutor-dashboard">
                  <Button size="sm" className="text-white hover:opacity-90" style={{ backgroundColor: '#1d636c' }}>
                    Tutor Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button size="sm" className="text-white hover:opacity-90" style={{ backgroundColor: '#1d636c' }}>
                    Dashboard
                  </Button>
                </Link>
              )
            ) : (
              <Link href="/login">
                <Button size="sm" className="text-white hover:opacity-90" style={{ backgroundColor: '#1d636c' }}>
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Tutor Profile Header */}
      <section className="relative py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-2 sticky top-24" style={{ borderColor: '#e5e7eb' }}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Profile Image */}
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
                        {tutor.profilePhoto ? (
                          <Image
                            src={tutor.profilePhoto}
                            alt={`${tutor.firstName} ${tutor.lastName}`}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1d636c' }}>
                            <GraduationCap className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      {tutor.verified && (
                        <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Name and Badges */}
                    <div className="space-y-3">
                      <h1 className="text-2xl font-bold" style={{ color: '#073045' }}>
                        {tutor.firstName} {tutor.lastName}
                      </h1>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <BadgeComponent className={getExperienceColor(tutor.experience)}>
                          {tutor.experience}
                        </BadgeComponent>
                        {tutor.verified && (
                          <BadgeComponent style={{ backgroundColor: '#10b981', color: 'white' }}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </BadgeComponent>
                        )}
                      </div>
                      <p className="text-gray-600">{tutor.qualification}</p>
                      <p className="text-sm text-gray-600">{tutor.university}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-5 w-5" style={{ color: '#e6941f' }} />
                        <span className="ml-1 font-bold text-lg">{tutor.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-600">({tutor.totalReviews} reviews)</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{tutor.location}</span>
                    </div>

                    {/* Stats */}
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Hourly Rate</span>
                        <span className="text-xl font-bold" style={{ color: '#073045' }}>
                          ₦{tutor.hourlyRate.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Availability</span>
                        <BadgeComponent
                          className={tutor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {tutor.isAvailable ? "Available" : "Not Available"}
                        </BadgeComponent>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full space-y-3">
                      <Button
                        className="w-full hover:opacity-90"
                        size="lg"
                        onClick={handleBookTutor}
                        disabled={!canBook || bookingLoading}
                        style={{ backgroundColor: '#e6941f', color: '#073045' }}
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : !tutor.isAvailable ? (
                          "Not Available"
                        ) : !isStudent ? (
                          "Students Only"
                        ) : (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Book This Tutor
                          </>
                        )}
                      </Button>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 border-2 hover:opacity-80"
                          size="sm"
                          style={{ borderColor: '#1d636c', color: '#1d636c' }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-2 hover:opacity-80"
                          size="sm"
                          style={{ borderColor: '#e6941f', color: '#e6941f' }}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
                <CardHeader>
                  <CardTitle className="text-2xl" style={{ color: '#073045' }}>About {tutor.firstName}</CardTitle>
                  <CardDescription>
                    {tutor.qualification} from {tutor.university}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-gray-600">
                    {tutor.bio || "No bio available."}
                  </p>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                          {tutor.totalStudents || tutor.totalSessions || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#e6941f' }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Sessions</p>
                        <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                          {tutor.totalSessions || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#073045' }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#073045' }}>
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                          {tutor.experience}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white border-2 p-1" style={{ borderColor: '#e5e7eb' }}>
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[#1d636c] data-[state=active]:text-white"
                style={{ color: '#073045' }}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="subjects" 
                className="data-[state=active]:bg-[#1d636c] data-[state=active]:text-white"
                style={{ color: '#073045' }}
              >
                Subjects & Packages
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:bg-[#1d636c] data-[state=active]:text-white"
                style={{ color: '#073045' }}
              >
                Reviews ({tutor.totalReviews})
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-[#1d636c] data-[state=active]:text-white"
                style={{ color: '#073045' }}
              >
                Details
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" style={{ color: '#1d636c' }} />
                      Teaching Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: '#073045' }}>Teaching Mode</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutor.teachingMode?.map((mode, index) => (
                          <div key={index}>{getTeachingModeBadge(mode)}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: '#073045' }}>Availability</h4>
                      <p className="text-gray-600">
                        {tutor.isAvailable
                          ? "Currently accepting new students"
                          : "Not currently accepting new students"}
                      </p>
                    </div>

                    {tutor.nyscInfo && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center" style={{ color: '#073045' }}>
                          <GraduationCap className="h-4 w-4 mr-2" />
                          NYSC Information
                        </h4>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">State of Deployment:</span>
                            <span className="font-medium">{tutor.nyscInfo.stateOfDeployment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Batch Year:</span>
                            <span className="font-medium">{tutor.nyscInfo.batchYear}</span>
                          </div>
                          {tutor.nyscInfo.ppa && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">PPA:</span>
                              <span className="font-medium">{tutor.nyscInfo.ppa}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" style={{ color: '#1d636c' }} />
                      Education Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tutor.educationInfo ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                            <GraduationCap className="h-6 w-6" style={{ color: '#1d636c' }} />
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#073045' }}>
                              {tutor.educationInfo.degree} in {tutor.educationInfo.discipline}
                            </h4>
                            <p className="text-gray-600">{tutor.educationInfo.university}</p>
                            <p className="text-sm text-gray-600">
                              Graduated {tutor.educationInfo.graduationYear}
                              {tutor.educationInfo.cgpa && ` • CGPA: ${tutor.educationInfo.cgpa}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">Education information not provided.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Subjects & Packages Tab */}
            <TabsContent value="subjects" className="space-y-6">
              <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: '#073045' }}>
                    <BookMarked className="h-5 w-5 mr-2" />
                    Subjects Offered
                  </CardTitle>
                  <CardDescription>
                    {tutor.subjects.length} subjects available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {tutor.subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="border-2 rounded-lg p-4 hover:border-[#1d636c] transition-colors"
                        style={{ borderColor: '#e5e7eb' }}
                      >
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" style={{ color: '#1d636c' }} />
                          <span className="font-medium">{subject}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: '#073045' }}>
                    <FileText className="h-5 w-5 mr-2" />
                    Exam Packages
                  </CardTitle>
                  <CardDescription>
                    Specialized packages for various exams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {tutor.packages.map((pkg, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow border-2" style={{ borderColor: '#e5e7eb' }}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold" style={{ color: '#073045' }}>{pkg}</h4>
                              <p className="text-sm text-gray-600">
                                Comprehensive {pkg} preparation
                              </p>
                            </div>
                            <BadgeComponent variant="secondary" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                              Available
                            </BadgeComponent>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              {/* Rating Summary */}
              <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#073045' }}>Student Reviews</CardTitle>
                  <CardDescription>
                    Overall rating based on {tutor.totalReviews} reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3 text-center">
                      <div className="text-5xl font-bold mb-2" style={{ color: '#073045' }}>{tutor.rating.toFixed(1)}</div>
                      <div className="flex items-center justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(tutor.rating)
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {tutor.totalReviews} total reviews
                      </p>
                    </div>

                    <div className="lg:w-2/3 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating, index) => {
                        const count = ratingDistribution[5 - rating];
                        const percentage = tutor.totalReviews
                          ? (count / tutor.totalReviews) * 100
                          : 0;

                        return (
                          <div key={rating} className="flex items-center space-x-2">
                            <div className="w-12 text-sm">{rating} stars</div>
                            <Progress value={percentage} className="flex-1 h-2" style={{ backgroundColor: '#e5e7eb' }} />
                            <div className="w-12 text-right text-sm text-gray-600">
                              {count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Review Form (for students only) */}
              {isStudent && (
                <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
                  <CardHeader>
                    <CardTitle style={{ color: '#073045' }}>Write a Review</CardTitle>
                    <CardDescription>
                      Share your experience with {tutor.firstName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rating" style={{ color: '#073045' }}>Rating</Label>
                        <div className="flex items-center space-x-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  star <= reviewForm.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                } hover:text-yellow-400`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="comment" style={{ color: '#073045' }}>Your Review</Label>
                        <textarea
                          id="comment"
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, comment: e.target.value })
                          }
                          placeholder="Share your experience with this tutor..."
                          className="w-full mt-1 p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d636c] min-h-[100px]"
                          style={{ borderColor: '#e5e7eb' }}
                          rows={4}
                        />
                      </div>

                      <Button
                        onClick={handleSubmitReview}
                        disabled={reviewLoading || !reviewForm.comment.trim()}
                        style={{ backgroundColor: '#1d636c', color: 'white' }}
                      >
                        {reviewLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Review"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#073045' }}>All Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              {review.studentPhoto ? (
                                <Image
                                  src={review.studentPhoto}
                                  alt={review.studentName}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <span className="font-semibold" style={{ color: '#1d636c' }}>
                                  {review.studentName.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-semibold" style={{ color: '#073045' }}>{review.studentName}</h4>
                                  <div className="flex items-center space-x-1">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-3 w-3 ${
                                            star <= review.rating
                                              ? "text-yellow-500 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="mt-2 text-gray-600">{review.comment}</p>
                              {review.subject && (
                                <BadgeComponent 
                                  variant="secondary" 
                                  className="mt-2"
                                  style={{ backgroundColor: '#e6941f', color: '#073045' }}
                                >
                                  {review.subject}
                                </BadgeComponent>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: '#1d636c' }} />
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#073045' }}>No reviews yet</h3>
                      <p className="text-gray-600">
                        Be the first to review {tutor.firstName}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card className="border-2" style={{ borderColor: '#e5e7eb' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#073045' }}>Tutor Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-8 md:grid-cols-2">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg" style={{ color: '#073045' }}>Personal Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                          <span className="text-gray-600">Full Name</span>
                          <span className="font-medium" style={{ color: '#073045' }}>
                            {tutor.firstName} {tutor.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                          <span className="text-gray-600">Qualification</span>
                          <span className="font-medium" style={{ color: '#073045' }}>{tutor.qualification}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                          <span className="text-gray-600">University</span>
                          <span className="font-medium" style={{ color: '#073045' }}>{tutor.university}</span>
                        </div>
                        {tutor.personalInfo?.dateOfBirth && (
                          <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                            <span className="text-gray-600">Date of Birth</span>
                            <span className="font-medium" style={{ color: '#073045' }}>
                              {new Date(tutor.personalInfo.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {tutor.personalInfo?.gender && (
                          <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                            <span className="text-gray-600">Gender</span>
                            <span className="font-medium" style={{ color: '#073045' }}>{tutor.personalInfo.gender}</span>
                          </div>
                        )}
                        {tutor.personalInfo?.stateOfOrigin && (
                          <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                            <span className="text-gray-600">State of Origin</span>
                            <span className="font-medium" style={{ color: '#073045' }}>
                              {tutor.personalInfo.stateOfOrigin}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Teaching Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg" style={{ color: '#073045' }}>Teaching Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                          <span className="text-gray-600">Hourly Rate</span>
                          <span className="font-medium" style={{ color: '#073045' }}>
                            ₦{tutor.hourlyRate.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                          <span className="text-gray-600">Experience</span>
                          <span className="font-medium" style={{ color: '#073045' }}>{tutor.experience}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                          <span className="text-gray-600">Location</span>
                          <span className="font-medium" style={{ color: '#073045' }}>{tutor.location}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
                          <span className="text-gray-600">Teaching Modes</span>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {tutor.teachingMode?.map((mode, index) => (
                              <BadgeComponent 
                                key={index} 
                                variant="secondary" 
                                className="text-xs"
                                style={{ backgroundColor: '#f3f4f6', color: '#073045', borderColor: '#e5e7eb' }}
                              >
                                {mode}
                              </BadgeComponent>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Status</span>
                          <BadgeComponent
                            className={tutor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {tutor.isAvailable ? "Available" : "Not Available"}
                          </BadgeComponent>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e6941f 0%, #d68516 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight text-white">
                Ready to learn with {tutor.firstName}?
              </h2>
              <p className="text-xl text-white/95 max-w-[800px] mx-auto leading-relaxed">
                Book your first session today and start your learning journey with one of our top-rated tutors.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                onClick={handleBookTutor}
                disabled={!canBook || bookingLoading}
                style={{ backgroundColor: '#073045', color: 'white' }}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Book Now - ₦{tutor.hourlyRate.toLocaleString()}/hour
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <Link href="/tutors">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-lg px-8 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all"
                >
                  Browse More Tutors
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ backgroundColor: '#073045' }}>
        <div className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6" style={{ color: '#e6941f' }} />
                <span className="text-xl font-bold text-white">Edumentor</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Connecting passionate tutors with Nigerian students for academic excellence.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">For Students</h4>
              <div className="space-y-2 text-sm">
                <Link href="/tutors" className="block text-white/80 hover:text-white transition-colors">
                  Find Tutors
                </Link>
                <Link href="/how-it-works" className="block text-white/80 hover:text-white transition-colors">
                  How It Works
                </Link>
                <Link href="/success-stories" className="block text-white/80 hover:text-white transition-colors">
                  Success Stories
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">For Tutors</h4>
              <div className="space-y-2 text-sm">
                <Link href="/become-tutor" className="block text-white/80 hover:text-white transition-colors">
                  Join as Tutor
                </Link>
                <Link href="/tutor-benefits" className="block text-white/80 hover:text-white transition-colors">
                  Benefits
                </Link>
                <Link href="/tutor-resources" className="block text-white/80 hover:text-white transition-colors">
                  Resources
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Support</h4>
              <div className="space-y-2 text-sm">
                <Link href="/help" className="block text-white/80 hover:text-white transition-colors">
                  Help Center
                </Link>
                <Link href="/contact" className="block text-white/80 hover:text-white transition-colors">
                  Contact Us
                </Link>
                <Link href="/privacy" className="block text-white/80 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/80">
            <p>&copy; 2024 Edumentor. All rights reserved. Made with ❤️ for Nigerian students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}