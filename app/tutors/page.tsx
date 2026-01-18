'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { 
  BookOpen, 
  Star, 
  MapPin, 
  Filter, 
  Search,
  Users,
  Clock,
  CheckCircle,
  X,
  Sparkles,
  Award,
  Shield,
  ChevronDown,
  Loader2,
  Calendar,
  MessageSquare,
  GraduationCap,
  ArrowRight,
  Heart,
  TrendingUp,
  Target,
  ArrowLeft,
  DollarSign,
  Calculator
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-hot-toast"
import { getTutors, createBooking, checkExistingBooking } from "@/lib/firebase/firestore"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Badge Component
function Badge({ variant, className, children, style }: any) {
  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`} style={style}>
      {children}
    </div>
  );
}

// Filters interface
interface Filters {
  search: string;
  subject: string;
  package: string;
  location: string;
  minRate: number;
  maxRate: number;
  availability: boolean;
  rating: number;
  experience: string;
  sortBy: string;
}

// Tutor interface
interface Tutor {
  id: string;
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
  teachingMode: string[];
  status: string;
  userId: string;
}

// Booking Dialog Props
interface BookingDialogProps {
  tutor: Tutor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmBooking: (hours: number, totalAmount: number) => Promise<void>;
  loading: boolean;
}

function BookingDialog({ tutor, open, onOpenChange, onConfirmBooking, loading }: BookingDialogProps) {
  const [hours, setHours] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<string>(tutor.subjects?.[0] || "");
  const [selectedPackage, setSelectedPackage] = useState<string>(tutor.packages?.[0] || "");

  const calculateTotalAmount = () => {
    return hours * tutor.hourlyRate;
  };

  const handleConfirm = async () => {
    if (hours < 1) {
      toast.error("Please select at least 1 hour");
      return;
    }
    
    if (hours > 50) {
      toast.error("Maximum 50 hours per booking");
      return;
    }

    const totalAmount = calculateTotalAmount();
    await onConfirmBooking(hours, totalAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book {tutor.firstName} {tutor.lastName}
          </DialogTitle>
          <DialogDescription>
            Specify the hours you want to book and the total amount will be calculated automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tutor Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {tutor.profilePhoto ? (
                <Image
                  src={tutor.profilePhoto}
                  alt={`${tutor.firstName} ${tutor.lastName}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1d636c' }}>
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: '#073045' }}>
                {tutor.firstName} {tutor.lastName}
              </h3>
              <p className="text-sm text-gray-600">Hourly Rate: ₦{tutor.hourlyRate.toLocaleString()}</p>
            </div>
          </div>

          {/* Subject Selection */}
          {tutor.subjects && tutor.subjects.length > 0 && (
            <div className="space-y-3">
              <Label htmlFor="subject" style={{ color: '#073045' }}>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full border-2" style={{ borderColor: '#e5e7eb' }}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {tutor.subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Package Selection */}
          {tutor.packages && tutor.packages.length > 0 && (
            <div className="space-y-3">
              <Label htmlFor="package" style={{ color: '#073045' }}>Package</Label>
              <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                <SelectTrigger className="w-full border-2" style={{ borderColor: '#e5e7eb' }}>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {tutor.packages.map((pkg) => (
                    <SelectItem key={pkg} value={pkg}>
                      {pkg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Hours Input */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="hours" style={{ color: '#073045' }}>Number of Hours</Label>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calculator className="h-4 w-4" />
                <span>₦{tutor.hourlyRate.toLocaleString()} × {hours} hour(s)</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHours(Math.max(1, hours - 1))}
                  className="border-2"
                  style={{ borderColor: '#1d636c', color: '#1d636c' }}
                >
                  -
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="number"
                    id="hours"
                    min="1"
                    max="50"
                    value={hours}
                    onChange={(e) => setHours(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="text-center text-lg border-2"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHours(Math.min(50, hours + 1))}
                  className="border-2"
                  style={{ borderColor: '#1d636c', color: '#1d636c' }}
                >
                  +
                </Button>
              </div>
              
              <Slider
                value={[hours]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => setHours(value[0])}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>1 hour</span>
                <span>10 hours</span>
                <span>20 hours</span>
              </div>
            </div>
          </div>

          {/* Amount Calculation */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Hourly Rate:</span>
              <span className="font-medium">₦{tutor.hourlyRate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hours:</span>
              <span className="font-medium">{hours} hour(s)</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold" style={{ color: '#073045' }}>Total Amount:</span>
              <span className="text-xl font-bold" style={{ color: '#e6941f' }}>
                ₦{calculateTotalAmount().toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * This amount is an estimate. The mentor will confirm the final schedule and amount.
            </p>
          </div>

          {/* Common Hour Packages */}
          <div>
            <Label className="mb-2 block" style={{ color: '#073045' }}>Quick Select Hours</Label>
            <div className="flex flex-wrap gap-2">
              {[2, 5, 10, 20].map((hourOption) => (
                <Button
                  key={hourOption}
                  type="button"
                  variant={hours === hourOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHours(hourOption)}
                  className={hours === hourOption ? "" : "border-2"}
                  style={
                    hours === hourOption
                      ? { backgroundColor: '#e6941f', color: '#073045' }
                      : { borderColor: '#1d636c', color: '#1d636c' }
                  }
                >
                  {hourOption} hours
                  <span className="ml-1 text-xs opacity-75">
                    (₦{(hourOption * tutor.hourlyRate).toLocaleString()})
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2"
            style={{ borderColor: '#1d636c', color: '#1d636c' }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="hover:opacity-90"
            style={{ backgroundColor: '#e6941f', color: '#073045' }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Interest
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TutorsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    search: "",
    subject: "all",
    package: "all",
    location: "all",
    minRate: 0,
    maxRate: 5000,
    availability: true,
    rating: 0,
    experience: "all",
    sortBy: "rating-desc"
  });

  // Available filters
  const subjects = [
    { value: "all", label: "All Subjects" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "English Language", label: "English Language" },
    { value: "Physics", label: "Physics" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Biology", label: "Biology" },
    { value: "Economics", label: "Economics" },
    { value: "Government", label: "Government" },
    { value: "Literature", label: "Literature" },
    { value: "Geography", label: "Geography" },
    { value: "History", label: "History" },
    { value: "Computer Science", label: "Computer Science" },
    { value: "French", label: "French" },
    { value: "CRS", label: "CRS" },
    { value: "IRS", label: "IRS" },
    { value: "Civic Education", label: "Civic Education" }
  ];

  const packages = [
    { value: "all", label: "All Packages" },
    { value: "JAMB UTME", label: "JAMB UTME" },
    { value: "WAEC", label: "WAEC" },
    { value: "NECO", label: "NECO" },
    { value: "Common Entrance", label: "Common Entrance" },
    { value: "Junior Secondary", label: "Junior Secondary" },
    { value: "Primary School", label: "Primary School" },
    { value: "A-Levels", label: "A-Levels" }
  ];

  const locations = [
    { value: "all", label: "All Locations" },
    { value: "Lagos", label: "Lagos" },
    { value: "Abuja", label: "Abuja" },
    { value: "Kano", label: "Kano" },
    { value: "Rivers", label: "Rivers" },
    { value: "Oyo", label: "Oyo" },
    { value: "Enugu", label: "Enugu" },
    { value: "Kaduna", label: "Kaduna" },
    { value: "Ogun", label: "Ogun" },
    { value: "Delta", label: "Delta" },
    { value: "Osun", label: "Osun" },
    { value: "Edo", label: "Edo" },
    { value: "Plateau", label: "Plateau" },
    { value: "Sokoto", label: "Sokoto" }
  ];

  const experienceLevels = [
    { value: "all", label: "All Experience" },
    { value: "1-2 years", label: "1-2 years" },
    { value: "3-5 years", label: "3-5 years" },
    { value: "5+ years", label: "5+ years" }
  ];

  const sortOptions = [
    { value: "rating-desc", label: "Rating (High to Low)" },
    { value: "rating-asc", label: "Rating (Low to High)" },
    { value: "rate-desc", label: "Rate (High to Low)" },
    { value: "rate-asc", label: "Rate (Low to High)" },
    { value: "sessions-desc", label: "Most Experienced" }
  ];

  // Load tutors on mount
  useEffect(() => {
    loadTutors();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters, tutors]);

  const loadTutors = async () => {
    setLoading(true);
    try {
      // Fetch tutors with filters
      const fetchedTutors = await getTutors({
        subject: filters.subject !== 'all' ? filters.subject : undefined,
        package: filters.package !== 'all' ? filters.package : undefined,
        location: filters.location !== 'all' ? filters.location : undefined,
        minRate: filters.minRate,
        maxRate: filters.maxRate,
        experience: filters.experience !== 'all' ? filters.experience : undefined,
        sortBy: filters.sortBy
      }) as Tutor[];
      
      setTutors(fetchedTutors);
    } catch (error) {
      console.error("Error loading tutors:", error);
      toast.error("Failed to load mentors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...tutors];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(tutor => 
        tutor.firstName.toLowerCase().includes(searchTerm) ||
        tutor.lastName.toLowerCase().includes(searchTerm) ||
        tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm)) ||
        (tutor.bio && tutor.bio.toLowerCase().includes(searchTerm)) ||
        (tutor.qualification && tutor.qualification.toLowerCase().includes(searchTerm)) ||
        (tutor.university && tutor.university.toLowerCase().includes(searchTerm))
      );
    }

    // Apply availability filter
    if (filters.availability) {
      result = result.filter(tutor => tutor.isAvailable);
    }

    // Apply rating filter
    if (filters.rating > 0) {
      result = result.filter(tutor => tutor.rating >= filters.rating);
    }

    // Apply experience filter locally
    if (filters.experience !== 'all') {
      result = result.filter(tutor => {
        switch(filters.experience) {
          case '1-2 years':
            return tutor.experience === '1-2 years';
          case '3-5 years':
            return tutor.experience === '3-5 years';
          case '5+ years':
            return tutor.experience === '5+ years';
          default:
            return true;
        }
      });
    }

    // Apply local sorting (if needed)
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "rating-desc":
          return b.rating - a.rating;
        case "rating-asc":
          return a.rating - b.rating;
        case "rate-desc":
          return b.hourlyRate - a.hourlyRate;
        case "rate-asc":
          return a.hourlyRate - b.hourlyRate;
        case "sessions-desc":
          return b.totalSessions - a.totalSessions;
        default:
          return 0;
      }
    });

    setFilteredTutors(result);
  };

  const handleBookTutor = (tutor: Tutor) => {
    if (!user) {
      toast.error("Please login to indicate interest in a mentor");
      router.push('/login');
      return;
    }

    if (!userData) {
      toast.error("Please complete your profile first");
      router.push('/dashboard');
      return;
    }

    if (userData.role !== 'student') {
      toast.error("Only students/parents can book mentors");
      return;
    }

    setSelectedTutor(tutor);
    setBookingDialogOpen(true);
  };

  const handleConfirmBooking = async (hours: number, totalAmount: number) => {
    if (!selectedTutor) return;

    setBookingLoading(selectedTutor.id);

    try {
      // Get the tutor to book
      const tutor = selectedTutor;
      
      // Check if student already has a booking with this tutor
      const hasExistingBooking = await checkExistingBooking(user!.uid, tutor.id);
      
      if (hasExistingBooking) {
        toast.error("You have already indicated interest in this mentor. Please check your bookings.");
        
        // Optionally redirect to bookings page
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      // Create booking/interest indication with hours and amount
      await createBooking({
        tutorId: tutor.id,
        tutorName: `${tutor.firstName} ${tutor.lastName}`,
        studentId: user!.uid,
        studentName: `${userData.firstName} ${userData.lastName}`,
        studentEmail: user!.email,
        studentPhone: userData.phone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        subject: tutor.subjects[0] || "General",
        package: tutor.packages[0] || "General",
        hourlyRate: tutor.hourlyRate,
        totalHours: hours,
        totalAmount: totalAmount,
        location: tutor.location,
        teachingMode: tutor.teachingMode?.[0] || "in-person",
        bookingDetails: {
          hoursRequested: hours,
          hourlyRate: tutor.hourlyRate,
          totalAmount: totalAmount,
          estimatedDuration: `${hours} hour(s)`,
          notes: `Interest indicated for ${hours} hour(s) of tutoring`
        }
      });

      toast.success(`Interest indicated successfully for ${hours} hour(s)! The mentor will contact you soon.`);
      
      setBookingDialogOpen(false);
      setSelectedTutor(null);
      
      // Optionally redirect to bookings page
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error("Booking error:", error);
      
      // Check for specific error message
      if (error.message.includes('already indicated interest')) {
        toast.error(error.message);
      } else {
        toast.error(`Failed to indicate interest: ${error.message}`);
      }
    } finally {
      setBookingLoading(null);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      subject: "all",
      package: "all",
      location: "all",
      minRate: 0,
      maxRate: 5000,
      availability: true,
      rating: 0,
      experience: "all",
      sortBy: "rating-desc"
    });
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case "5+ years": return "bg-purple-100 text-purple-800";
      case "3-5 years": return "bg-blue-100 text-blue-800";
      case "1-2 years": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Refresh tutors when filters change significantly
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Reload tutors from Firestore if certain filters change
    if (['subject', 'package', 'location', 'minRate', 'maxRate', 'experience', 'sortBy'].includes(key)) {
      loadTutors();
    }
  };

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
              Find Mentors
            </Link>
            <Link href="/become-tutor" className="text-sm font-medium hover:opacity-80 transition-colors" style={{ color: '#073045' }}>
              Become a Mentor
            </Link>
            <Link href="/about" className="text-sm font-medium hover:opacity-80 transition-colors" style={{ color: '#073045' }}>
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:opacity-80" style={{ color: '#073045' }}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            {user ? (
              userData?.role === 'mentor' || userData?.role === 'tutor_applicant' ? (
                <Link href="/mentor-dashboard">
                  <Button size="sm" className="text-white hover:opacity-90" style={{ backgroundColor: '#1d636c' }}>
                    Mentor Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button size="sm" className="text-white hover:opacity-90" style={{ backgroundColor: '#1d636c' }}>
                    Student Dashboard
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

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #073045 0%, #1d636c 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit mx-auto lg:mx-0 px-4 py-2 text-sm font-semibold" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                  <Sparkles className="inline h-4 w-4 mr-2" />
                  🇳🇬 Find Your Perfect Match
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
                  Discover Expert <span style={{ color: '#e6941f' }}>Mentors</span>
                </h1>
                <p className="text-xl text-white/90 max-w-[600px] mx-auto lg:mx-0 leading-relaxed">
                  Browse through our verified NYSC corps members and experienced mentors. 
                  Find the perfect match for your child's learning needs and goals.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="#tutors-grid">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 hover:opacity-90" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                    Browse Mentors
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center justify-center lg:justify-start space-x-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-sm text-white/80">Expert Mentors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#e6941f' }}>4.9/5</div>
                    <div className="text-sm text-white/80">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">95%</div>
                    <div className="text-sm text-white/80">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
                  alt="Mentor teaching student"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border-2" style={{ borderColor: '#e6941f' }}>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6" style={{ color: '#1d636c' }} />
                  <div>
                    <div className="font-bold text-xl" style={{ color: '#073045' }}>2,000+</div>
                    <div className="text-sm text-gray-600">Happy Students</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section id="tutors-grid" className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#073045' }}>
              Find Your Perfect Mentor
            </h2>
            <p className="text-lg text-gray-600 max-w-[800px] mx-auto">
              Filter by subject, location, experience, and more to find the ideal mentor for your needs
            </p>
          </div>

          <Card className="shadow-xl border-2 mb-8" style={{ borderColor: '#e5e7eb' }}>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Main Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Search by name, subject, university, or keywords..." 
                      className="pl-12 py-6 text-lg border-2"
                      style={{ borderColor: '#e5e7eb' }}
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="gap-2 border-2 h-12"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    style={{ borderColor: '#1d636c', color: '#1d636c' }}
                  >
                    <Filter className="h-4 w-4" />
                    Advanced Filters
                    <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {(filters.search || filters.subject !== "all" || filters.package !== "all" || filters.location !== "all" || filters.minRate > 0 || filters.maxRate < 5000 || filters.rating > 0 || filters.experience !== "all") && (
                    <Button 
                      variant="ghost" 
                      size="lg"
                      onClick={resetFilters}
                      className="gap-2 hover:opacity-80"
                      style={{ color: '#073045' }}
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: '#073045' }}>Subject</Label>
                    <Select
                      value={filters.subject}
                      onValueChange={(value) => handleFilterChange('subject', value)}
                    >
                      <SelectTrigger className="w-[180px] border-2" style={{ borderColor: '#e5e7eb' }}>
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: '#073045' }}>Package</Label>
                    <Select
                      value={filters.package}
                      onValueChange={(value) => handleFilterChange('package', value)}
                    >
                      <SelectTrigger className="w-[180px] border-2" style={{ borderColor: '#e5e7eb' }}>
                        <SelectValue placeholder="Package" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map(pkg => (
                          <SelectItem key={pkg.value} value={pkg.value}>
                            {pkg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: '#073045' }}>Location</Label>
                    <Select
                      value={filters.location}
                      onValueChange={(value) => handleFilterChange('location', value)}
                    >
                      <SelectTrigger className="w-[180px] border-2" style={{ borderColor: '#e5e7eb' }}>
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: '#073045' }}>Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger className="w-[200px] border-2" style={{ borderColor: '#e5e7eb' }}>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="grid gap-8 md:grid-cols-3 p-6 bg-gray-50 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                    <div className="space-y-4">
                      <Label className="font-semibold" style={{ color: '#073045' }}>Hourly Rate (₦)</Label>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Input 
                            type="number" 
                            value={filters.minRate}
                            onChange={(e) => handleFilterChange('minRate', parseInt(e.target.value) || 0)}
                            className="w-28 border-2"
                            style={{ borderColor: '#e5e7eb' }}
                            min="0"
                            max="10000"
                          />
                          <span className="text-gray-600">to</span>
                          <Input 
                            type="number" 
                            value={filters.maxRate}
                            onChange={(e) => handleFilterChange('maxRate', parseInt(e.target.value) || 5000)}
                            className="w-28 border-2"
                            style={{ borderColor: '#e5e7eb' }}
                            min="0"
                            max="10000"
                          />
                        </div>
                        <Slider
                          value={[filters.minRate, filters.maxRate]}
                          max={10000}
                          step={500}
                          onValueChange={(value) => {
                            handleFilterChange('minRate', value[0]);
                            handleFilterChange('maxRate', value[1]);
                          }}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>₦0</span>
                          <span>₦5,000</span>
                          <span>₦10,000</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="font-semibold" style={{ color: '#073045' }}>Minimum Rating</Label>
                      <div className="space-y-2">
                        {[0, 3, 3.5, 4, 4.5].map(rating => (
                          <div key={rating} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`rating-${rating}`}
                              name="rating"
                              checked={filters.rating === rating}
                              onChange={() => handleFilterChange('rating', rating)}
                              className="h-4 w-4"
                              style={{ accentColor: '#1d636c' }}
                            />
                            <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center">
                              {rating === 0 ? "Any rating" : `${rating}+ `}
                              {rating > 0 && <Star className="h-3 w-3 ml-1" style={{ color: '#e6941f' }} />}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="font-semibold" style={{ color: '#073045' }}>Experience Level</Label>
                      <Select
                        value={filters.experience}
                        onValueChange={(value) => handleFilterChange('experience', value)}
                      >
                        <SelectTrigger className="border-2" style={{ borderColor: '#e5e7eb' }}>
                          <SelectValue placeholder="Any experience" />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceLevels.map(exp => (
                            <SelectItem key={exp.value} value={exp.value}>{exp.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="availability"
                            checked={filters.availability}
                            onChange={(e) => handleFilterChange('availability', e.target.checked)}
                            className="h-4 w-4"
                            style={{ accentColor: '#1d636c' }}
                          />
                          <Label htmlFor="availability" className="text-sm cursor-pointer">
                            Show only available mentors
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Filters */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {filters.search && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                      Search: {filters.search}
                      <button onClick={() => handleFilterChange('search', '')} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.subject && filters.subject !== "all" && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1" style={{ backgroundColor: '#1d636c', color: 'white' }}>
                      Subject: {filters.subject}
                      <button onClick={() => handleFilterChange('subject', 'all')} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.package && filters.package !== "all" && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1" style={{ backgroundColor: '#073045', color: 'white' }}>
                      Package: {filters.package}
                      <button onClick={() => handleFilterChange('package', 'all')} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.location && filters.location !== "all" && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                      Location: {filters.location}
                      <button onClick={() => handleFilterChange('location', 'all')} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(filters.minRate > 0 || filters.maxRate < 5000) && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1" style={{ backgroundColor: '#1d636c', color: 'white' }}>
                      Rate: ₦{filters.minRate} - ₦{filters.maxRate}
                      <button onClick={() => {
                        handleFilterChange('minRate', 0);
                        handleFilterChange('maxRate', 5000);
                      }} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.rating > 0 && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1" style={{ backgroundColor: '#073045', color: 'white' }}>
                      Rating: {filters.rating}+
                      <button onClick={() => handleFilterChange('rating', 0)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.experience && filters.experience !== "all" && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                      Experience: {filters.experience}
                      <button onClick={() => handleFilterChange('experience', 'all')} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#073045' }}>Available Mentors</h2>
              <p className="text-gray-600">
                {loading ? "Loading..." : `${filteredTutors.length} mentors found`}
              </p>
            </div>
            {filteredTutors.length > 0 && (
              <div className="text-sm text-gray-600">
                Showing {Math.min(filteredTutors.length, 9)} of {filteredTutors.length} mentors
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: '#1d636c' }} />
              <p className="text-gray-600">Loading mentors...</p>
            </div>
          ) : filteredTutors.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTutors.slice(0, 9).map((tutor) => (
                  <MentorCard 
                    key={tutor.id}
                    tutor={tutor}
                    onBookMentor={handleBookTutor}
                    bookingLoading={bookingLoading}
                    isAuthenticated={!!user && userData?.role === 'student'}
                    userRole={userData?.role}
                  />
                ))}
              </div>

              {/* Load More */}
              {filteredTutors.length > 9 && (
                <div className="text-center mt-12">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 hover:opacity-80"
                    style={{ borderColor: '#1d636c', color: '#1d636c' }}
                  >
                    Load More Mentors (Showing 9 of {filteredTutors.length})
                  </Button>
                </div> 
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Users className="h-16 w-16 mx-auto mb-4" style={{ color: '#1d636c' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#073045' }}>No mentors found</h3>
              <p className="text-gray-600 mb-6">
                {tutors.length === 0 
                  ? "No mentors are currently available. Please check back later."
                  : "Try adjusting your filters to find more mentors."
                }
              </p>
              {tutors.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="border-2 hover:opacity-80"
                  style={{ borderColor: '#e6941f', color: '#e6941f' }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}

          {/* Stats Section */}
          <div className="mt-16 pt-8 border-t" style={{ borderTopColor: '#e5e7eb' }}>
            <div className="grid gap-6 md:grid-cols-4 text-center">
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: '#073045' }}>{tutors.length}</div>
                <div className="text-sm text-gray-600">Total Mentors</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: '#1d636c' }}>
                  {tutors.filter(t => t.verified).length}
                </div>
                <div className="text-sm text-gray-600">Verified Mentors</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: '#e6941f' }}>
                  {tutors.length > 0 ? (tutors.reduce((sum, t) => sum + t.rating, 0) / tutors.length).toFixed(1) : "0.0"}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: '#073045' }}>
                  {tutors.filter(t => t.isAvailable).length}
                </div>
                <div className="text-sm text-gray-600">Available Now</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#073045' }}>
              How to Book a Mentor
            </h2>
            <p className="text-xl text-gray-600 max-w-[800px] mx-auto">
              Simple steps to connect with the perfect mentor for your child
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#1d636c' }}>
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Find a Mentor</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse mentors by subject, location, and rating to find the perfect match for your child's needs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#e6941f' }}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#e6941f' }}>
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Specify Hours</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose how many hours you need. The total amount is calculated automatically based on the mentor's rate.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#073045' }}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#073045' }}>
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Start Learning</h3>
                <p className="text-gray-600 leading-relaxed">
                  Once confirmed, begin personalized mentoring sessions and track your child's progress.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e6941f 0%, #d68516 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight text-white">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-white/95 max-w-[800px] mx-auto leading-relaxed">
                Join thousands of Nigerian students who have improved their grades with Edumentor's expert mentors.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {user ? (
                userData?.role === 'student' ? (
                  <Link href="#tutors-grid">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" style={{ backgroundColor: '#073045', color: 'white' }}>
                      Browse Mentors Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/become-tutor">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" style={{ backgroundColor: '#073045', color: 'white' }}>
                      Become a Mentor
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" style={{ backgroundColor: '#073045', color: 'white' }}>
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/packages">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all">
                      View Packages
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Dialog */}
      {selectedTutor && (
        <BookingDialog
          tutor={selectedTutor}
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          onConfirmBooking={handleConfirmBooking}
          loading={bookingLoading === selectedTutor.id}
        />
      )}

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
                Connecting Nigerian students with qualified mentors for academic excellence.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">For Parents</h4>
              <div className="space-y-2 text-sm">
                <Link href="/tutors" className="block text-white/80 hover:text-white transition-colors">
                  Find Mentors
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
              <h4 className="font-semibold text-white">For Mentors</h4>
              <div className="space-y-2 text-sm">
                <Link href="/become-tutor" className="block text-white/80 hover:text-white transition-colors">
                  Join as Mentor
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

// Mentor Card Component
interface MentorCardProps {
  tutor: Tutor;
  onBookMentor: (tutor: Tutor) => void;
  bookingLoading: string | null;
  isAuthenticated: boolean;
  userRole?: string;
}

function MentorCard({ 
  tutor, 
  onBookMentor, 
  bookingLoading,
  isAuthenticated,
  userRole
}: MentorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);
  
  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case "5+ years": return "bg-purple-100 text-purple-800";
      case "3-5 years": return "bg-blue-100 text-blue-800";
      case "1-2 years": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleBookClick = () => {
    if (!tutor.isAvailable) {
      toast.error("This mentor is not currently available");
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("Please login to book a mentor");
      return;
    }
    
    if (userRole !== 'student') {
      toast.error("Only students/parents can book mentors");
      return;
    }
    
    onBookMentor(tutor);
  };

  const isButtonDisabled = !tutor.isAvailable || 
    bookingLoading === tutor.id || 
    !isAuthenticated || 
    userRole !== 'student';

  const getButtonText = () => {
    if (bookingLoading === tutor.id) {
      return (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Loading...
        </>
      );
    }
    if (!tutor.isAvailable) {
      return "Not Available";
    }
    if (!isAuthenticated) {
      return "Login to Book";
    }
    if (userRole !== 'student') {
      return "Students Only";
    }
    return "Indicate Interest";
  };

  const getButtonStyle = () => {
    if (!tutor.isAvailable || !isAuthenticated || userRole !== 'student') {
      return { backgroundColor: '#e5e7eb', color: '#6b7280' };
    }
    return { backgroundColor: '#e6941f', color: '#073045' };
  };

  return (
    <Card 
      className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 h-full flex flex-col group" 
      style={{ borderColor: '#e5e7eb' }}
      data-mentor-id={tutor.id}
    >
      {/* Availability Badge */}
      <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-medium ${
        tutor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {tutor.isAvailable ? 'Available' : 'Not Available'}
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
                {tutor.profilePhoto ? (
                  <Image
                    src={tutor.profilePhoto}
                    alt={`${tutor.firstName} ${tutor.lastName}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1d636c' }}>
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              {tutor.verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-lg" style={{ color: '#073045' }}>
                {tutor.firstName} {tutor.lastName}
              </CardTitle>
              <CardDescription className="text-sm">{tutor.qualification}</CardDescription>
              <p className="text-xs text-gray-600">{tutor.university}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Rating and Location */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4" style={{ color: '#e6941f' }} />
            <span className="font-medium">{tutor.rating.toFixed(1)}</span>
            <span className="text-gray-600">({tutor.totalReviews} reviews)</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="h-3 w-3" />
            <span className="text-xs">{tutor.location}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="p-2 rounded text-center" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="text-gray-600 text-xs">Experience</div>
            <div className="font-medium text-xs" style={{ color: '#073045' }}>{tutor.experience}</div>
          </div>
          <div className="p-2 rounded text-center" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="text-gray-600 text-xs">Hourly Rate</div>
            <div className="font-medium text-xs" style={{ color: '#073045' }}>₦{tutor.hourlyRate.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded text-center" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="text-gray-600 text-xs">Sessions</div>
            <div className="font-medium text-xs" style={{ color: '#073045' }}>{tutor.totalSessions}</div>
          </div>
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <p className="text-sm font-medium" style={{ color: '#073045' }}>Subjects:</p>
          <div className="flex flex-wrap gap-1">
            {tutor.subjects?.slice(0, 3).map((subject, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs border" 
                style={{ borderColor: '#1d636c', color: '#1d636c' }}
              >
                {subject}
              </Badge>
            ))}
            {tutor.subjects && tutor.subjects.length > 3 && (
              <Badge 
                variant="secondary" 
                className="text-xs" 
                style={{ backgroundColor: '#e6941f', color: '#073045' }}
              >
                +{tutor.subjects.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Bio - Expandable */}
        <div className="space-y-2">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-sm font-medium text-left"
            style={{ color: '#073045' }}
          >
            <span>About</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <p className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
            {tutor.bio || "No bio available"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 mt-auto">
          <Link href={`/tutors/${tutor.id}`} className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-2 hover:opacity-80"
              style={{ borderColor: '#1d636c', color: '#1d636c' }}
            >
              View Profile
            </Button>
          </Link>
          <Button 
            size="sm" 
            className="flex-1 hover:opacity-90 transition-all duration-200"
            onClick={handleBookClick}
            disabled={isButtonDisabled}
            style={getButtonStyle()}
          >
            {getButtonText()}
          </Button>
        </div>

        {/* Hourly Rate Calculator */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-medium text-blue-900 mb-1">Calculate session cost:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="text-blue-700">1 hour:</div>
            <div className="font-semibold text-right">₦{tutor.hourlyRate.toLocaleString()}</div>
            <div className="text-blue-700">5 hours:</div>
            <div className="font-semibold text-right">₦{(tutor.hourlyRate * 5).toLocaleString()}</div>
            <div className="text-blue-700">10 hours:</div>
            <div className="font-semibold text-right">₦{(tutor.hourlyRate * 10).toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}