'use client';

import { useState, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Upload, CheckCircle, DollarSign, Clock, Users, GraduationCap, MapPin, Calendar, ArrowRight, Sparkles, Target, Award, TrendingUp, Heart, ArrowLeft, Loader2, Shield, FileText, UserCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { usePaystackPayment } from "@/hooks/usePaystack"
import { toast } from "react-hot-toast"
import { uploadFile } from "@/lib/firebase/storage"
import { createTutorApplication, updateTutorApplication } from "@/lib/firebase/tutorApplication"
import { useRouter } from "next/navigation"
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Nigerian states
const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", 
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", 
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", 
  "Yobe", "Zamfara"
]

// Subjects
const subjects = [
  "Mathematics", "English Language", "Physics", "Chemistry", "Biology", 
  "Geography", "Economics", "Government", "Literature", "History", 
  "Computer Science", "Further Mathematics", "Agricultural Science", 
  "French", "Yoruba", "Hausa", "Igbo", "CRS", "IRS", "Civic Education"
]

// Packages
const packages = [
  "JAMB UTME", "WAEC", "NECO", "Common Entrance", 
  "Junior Secondary", "Primary School", "A-Levels", "IGCSE"
]

export default function BecomeTutorPage() {
  const { user, userData, registerTutor } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isNewTutorRegistration, setIsNewTutorRegistration] = useState(false);
  
  // Separate registration form data
  const [registrationData, setRegistrationData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: ""
  });

  // Application form data
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      stateOfOrigin: "",
      currentLocation: "",
      address: "",
    },
    nysc: {
      deploymentNumber: "",
      stateOfDeployment: "",
      ppa: "",
      batchYear: new Date().getFullYear().toString(),
      callUpNumber: "",
    },
    education: {
      university: "",
      degree: "B.Sc",
      graduationYear: new Date().getFullYear().toString(),
      cgpa: "",
      discipline: "",
    },
    teaching: {
      subjects: [] as string[],
      packages: [] as string[],
      experience: "",
      preferredMode: "both",
      availability: [] as string[],
      hourlyRate: "2500",
      bio: "",
      teachingPhilosophy: "",
    },
    documents: {
      profilePhoto: null as { url: string, name: string, size: number, type: string } | null,
      nyscIdFront: null as { url: string, name: string, size: number, type: string } | null,
      nyscIdBack: null as { url: string, name: string, size: number, type: string } | null,
      certificate: null as { url: string, name: string, size: number, type: string } | null,
      cv: null as { url: string, name: string, size: number, type: string } | null,
    },
    payment: {
      amount: 5000,
      reference: "",
      status: "pending"
    },
    termsAccepted: false,
  });

  const { initializePayment } = usePaystackPayment();

  useEffect(() => {
    // If user is logged in and is a tutor applicant, prepopulate data
    if (user && userData) {
      if (userData.role === 'tutor_applicant' || userData.role === 'tutor') {
        setIsNewTutorRegistration(false);
        // Prepopulate form data with user data
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || user.email || "",
            phone: userData.phone || ""
          }
        }));
        
        // If tutor application is already submitted, skip to appropriate step
        if (userData.tutorStatus === 'approved') {
          toast("You are already an approved tutor!");
          router.push('/tutor-dashboard');
        } else if (userData.tutorStatus === 'pending_payment') {
          setStep(3); // Go to payment step
        }
      }
    } else {
      setIsNewTutorRegistration(true);
    }
  }, [user, userData, router]);

  const handleRegistrationInputChange = (field: string, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (registrationData.password !== registrationData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (registrationData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        phone: registrationData.phone,
        role: "tutor_applicant"
      };

      const result = await registerTutor(registrationData.email, registrationData.password, userData);
      
      if (result.success) {
        // Prepopulate form with registration data
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            firstName: registrationData.firstName,
            lastName: registrationData.lastName,
            email: registrationData.email,
            phone: registrationData.phone
          }
        }));
        
        setIsNewTutorRegistration(false);
        setStep(2); // Move to personal info step
        toast.success("Registration successful! Please complete your application.");
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    if (section === 'termsAccepted') {
      setFormData(prev => ({
        ...prev,
        termsAccepted: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: value
        }
      }));
    }
  };

  const handleFileUpload = async (field: string, file: File) => {
    if (!file) return;
    if (!user) {
      toast.error("Please login or register first");
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [field]: 0 }));
      
      // Upload file to Firebase Storage
      const downloadURL = await uploadFile(
        file,
        `tutor-documents/${user.uid}/${field}/${Date.now()}_${file.name}`,
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [field]: progress }));
        }
      );

      // Store only metadata and URL, not the File object
      handleInputChange('documents', field, {
        url: downloadURL,
        name: file.name,
        size: file.size,
        type: file.type
      });

      toast.success(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} uploaded successfully!`);
    } catch (error: any) {
      toast.error(`Failed to upload file: ${error.message}`);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      teaching: {
        ...prev.teaching,
        subjects: prev.teaching.subjects.includes(subject)
          ? prev.teaching.subjects.filter(s => s !== subject)
          : [...prev.teaching.subjects, subject]
      }
    }));
  };

  const handlePackageToggle = (pkg: string) => {
    setFormData(prev => ({
      ...prev,
      teaching: {
        ...prev.teaching,
        packages: prev.teaching.packages.includes(pkg)
          ? prev.teaching.packages.filter(p => p !== pkg)
          : [...prev.teaching.packages, pkg]
      }
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        // Registration validation
        if (isNewTutorRegistration) {
          return !!(
            registrationData.email &&
            registrationData.password &&
            registrationData.confirmPassword &&
            registrationData.firstName &&
            registrationData.lastName &&
            registrationData.phone
          );
        }
        return true;
      case 2:
        const personal = formData.personalInfo;
        return !!(
          personal.firstName && 
          personal.lastName && 
          personal.email && 
          personal.phone && 
          personal.dateOfBirth && 
          personal.gender && 
          personal.stateOfOrigin && 
          personal.currentLocation
        );
      case 3:
        const education = formData.education;
        const nysc = formData.nysc;
        const teaching = formData.teaching;
        const docs = formData.documents;
        
        return !!(
          education.university && 
          education.degree && 
          education.discipline && 
          education.graduationYear && 
          nysc.deploymentNumber && 
          nysc.stateOfDeployment &&
          teaching.subjects.length > 0 && 
          teaching.packages.length > 0 && 
          teaching.hourlyRate && 
          docs.profilePhoto && 
          docs.nyscIdFront && 
          docs.certificate && 
          formData.termsAccepted
        );
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (!validateStep(step)) {
      toast.error("Please fill all required fields");
      return;
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

 const updateUserDocument = async (data: any) => {
    if (!user) {
      toast.error("No user logged in");
      return false;
    }
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error: any) {
      console.error('Error updating user document:', error);
      toast.error("Failed to update user data");
      return false;
    }
  };

 const handleSubmit = async () => {
  if (!user) {
    toast.error("Please login or register first");
    return;
  }

  if (!formData.termsAccepted) {
    toast.error("Please accept the terms and conditions");
    return;
  }

  setLoading(true);

  try {
    // Prepare application data
    const applicationData = {
      userId: user.uid,
      userEmail: user.email || formData.personalInfo.email,
      firstName: formData.personalInfo.firstName,
      lastName: formData.personalInfo.lastName,
      phone: formData.personalInfo.phone,
      personalInfo: formData.personalInfo,
      nysc: formData.nysc,
      education: formData.education,
      teaching: {
        ...formData.teaching,
        subjects: formData.teaching.subjects,
        packages: formData.teaching.packages,
        availability: formData.teaching.availability,
      },
      documents: formData.documents,
      payment: {
        ...formData.payment,
        reference: `TUTOR-${Date.now()}-${user.uid.slice(0, 8)}`,
      },
      termsAccepted: formData.termsAccepted,
      applicationDate: new Date().toISOString(),
      status: 'pending_payment'
    };

    // First save application to Firestore
    const applicationId = await createTutorApplication(applicationData);

    // Create payment reference
    const paymentReference = `TUTOR-${Date.now()}-${user.uid.slice(0, 8)}`;

    // Save payment reference to user data
    await updateUserDocument({
      pendingApplicationId: applicationId,
      paymentReference: paymentReference
    });

    // Store applicationId for use in callback
    const handlePaymentResponse = async (response: any) => {
      console.log("Payment response received:", response);
      
      // Reset loading state
      setLoading(false);
      
      if (response.status === 'success' || response.message === 'Approved') {
        try {
          // Update application status
          await updateTutorApplication(applicationId, {
            paymentStatus: 'completed',
            paymentReference: response.reference || response.trxref,
            status: 'pending_review',
            updatedAt: new Date().toISOString(),
          });

          // Update user data
          await updateUserDocument({
            role: 'tutor_applicant',
            tutorStatus: 'pending_review',
            applicationId: applicationId,
            paymentReference: response.reference || response.trxref
          });

          toast.success("Payment successful! Your application is under review.");
          
          // Show success message with next steps
          toast(
            <div className="space-y-2">
              <p className="font-semibold">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Check your email for login credentials</li>
                <li>Use the provided password to login</li>
                <li>Complete your tutor profile setup</li>
                <li>Wait for approval (2-3 business days)</li>
              </ol>
            </div>,
            { duration: 10000 }
          );
          
          setStep(4);
        } catch (error: any) {
          console.error('Error updating after payment:', error);
          toast.error(`Error updating application: ${error.message}`);
        }
      } else {
        toast.error("Payment was not successful. Please try again.");
      }
    };

    // Initialize payment with all necessary metadata
    initializePayment({
      email: user.email || formData.personalInfo.email,
      amount: formData.payment.amount * 100, // Convert to kobo
      reference: paymentReference,
      metadata: {
        userId: user.uid,
        applicationId: applicationId,
        applicationType: "tutor_registration",
        amount: formData.payment.amount,
        firstName: formData.personalInfo.firstName,
        lastName: formData.personalInfo.lastName,
        phone: formData.personalInfo.phone,
        tutorName: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`,
        tutorEmail: user.email || formData.personalInfo.email,
      },
      callback: (response: any) => {
        console.log("Paystack callback triggered");
        // Use setTimeout to avoid blocking the callback
        setTimeout(() => {
          handlePaymentResponse(response);
        }, 0);
      },
      onClose: () => {
        console.log("Payment window closed by user");
        if (!loading) {
          toast.error("Payment cancelled. Please complete payment to submit your application.");
        }
        setLoading(false);
      },
    });

  } catch (error: any) {
    toast.error(`Error processing application: ${error.message}`);
    setLoading(false);
  }
};

  const renderStep = () => {
    switch (step) {
      case 1:
        if (isNewTutorRegistration) {
          return <RegistrationStep 
            registrationData={registrationData} 
            handleRegistrationInputChange={handleRegistrationInputChange}
            loading={loading}
          />;
        } else {
          return <PersonalInfoStep formData={formData} handleInputChange={handleInputChange} />;
        }
      case 2:
        return <PersonalInfoStep formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <EducationAndTeachingStep 
          formData={formData} 
          handleInputChange={handleInputChange}
          handleSubjectToggle={handleSubjectToggle}
          handlePackageToggle={handlePackageToggle}
          handleFileUpload={handleFileUpload}
          uploadProgress={uploadProgress}
        />;
      case 4:
        return <ConfirmationStep />;
      default:
        if (isNewTutorRegistration) {
          return <RegistrationStep 
            registrationData={registrationData} 
            handleRegistrationInputChange={handleRegistrationInputChange}
            loading={loading}
          />;
        } else {
          return <PersonalInfoStep formData={formData} handleInputChange={handleInputChange} />;
        }
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
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:opacity-80" style={{ color: '#073045' }}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
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
                  🇳🇴 Join Our Tutor Community
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
                  Share Your Knowledge, <span style={{ color: '#e6941f' }}>Earn Income</span>
                </h1>
                <p className="text-xl text-white/90 max-w-[600px] mx-auto lg:mx-0 leading-relaxed">
                  Turn your academic expertise into a rewarding career. Help Nigerian students excel while earning competitive income as an Edumentor tutor.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="#application-form">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 hover:opacity-90" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                    Start Application
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center justify-center lg:justify-start space-x-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">₦5K - 50K</div>
                    <div className="text-sm text-white/80">Monthly Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#e6941f' }}>500+</div>
                    <div className="text-sm text-white/80">Active Tutors</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                  alt="Tutor teaching students"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border-2" style={{ borderColor: '#e6941f' }}>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6" style={{ color: '#1d636c' }} />
                  <div>
                    <div className="font-bold text-xl" style={{ color: '#073045' }}>₦5,000</div>
                    <div className="text-sm text-gray-600">One-time Application Fee</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section id="application-form" className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#073045' }}>
              Complete Your Application in 3 Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-[800px] mx-auto">
              Our streamlined process makes it easy to join our community of passionate educators
            </p>
          </div>
          
          <div className="mb-12">
            <div className="flex justify-center space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                    step === stepNum 
                      ? 'text-white border-transparent shadow-lg transform scale-110 transition-transform duration-300' 
                      : step > stepNum 
                      ? 'text-white border-transparent'
                      : 'border-gray-300 text-gray-500'
                  }`} style={{
                    backgroundColor: step === stepNum ? '#1d636c' : step > stepNum ? '#10b981' : 'transparent'
                  }}>
                    {step > stepNum ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="text-xl font-bold">{stepNum}</span>
                    )}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-16 h-1 mx-4 ${
                      step > stepNum ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6 text-center max-w-4xl mx-auto">
              <div>
                <p className={`text-sm font-medium ${
                  step === 1 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {isNewTutorRegistration ? "Create Account" : "Personal Info"}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  step === 2 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Personal Information
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  step === 3 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Education & Documents
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  step === 4 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Confirmation
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <Card className="shadow-2xl border-2 max-w-4xl mx-auto" style={{ borderColor: '#e5e7eb' }}>
            <CardHeader className="space-y-1 pb-6 border-b" style={{ borderBottomColor: '#f3f4f6' }}>
              <CardTitle className="text-3xl font-bold text-center" style={{ color: '#073045' }}>
                {step === 1 && (isNewTutorRegistration ? "Create Your Tutor Account" : "Personal Information")}
                {step === 2 && "Personal Information"}
                {step === 3 && "Education & Teaching Details"}
                {step === 4 && "Application Complete!"}
              </CardTitle>
              <CardDescription className="text-center text-lg">
                {step === 1 && (isNewTutorRegistration ? "Create your tutor account first" : "Tell us about yourself")}
                {step === 2 && "Tell us about yourself"}
                {step === 3 && "Your educational background and teaching preferences"}
                {step === 4 && "Your application has been submitted"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {renderStep()}
              
              {/* Navigation Buttons */}
              {step < 4 && (
                <div className="flex justify-between mt-12 pt-8 border-t" style={{ borderTopColor: '#f3f4f6' }}>
                  {step > 1 ? (
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousStep}
                      disabled={loading}
                      size="lg"
                      className="border-2 hover:opacity-80"
                      style={{ borderColor: '#1d636c', color: '#1d636c' }}
                    >
                      Back
                    </Button>
                  ) : (
                    <Link href="/">
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-2 hover:opacity-80"
                        style={{ borderColor: '#073045', color: '#073045' }}
                      >
                        Cancel
                      </Button>
                    </Link>
                  )}
                  
                  {step < 3 ? (
                    <Button 
                      className="ml-auto hover:opacity-90"
                      onClick={step === 1 && isNewTutorRegistration ? handleRegistrationSubmit : handleNextStep}
                      disabled={loading}
                      size="lg"
                      style={{ backgroundColor: '#1d636c', color: 'white' }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  ) : step === 3 ? (
                    <Button 
                      className="ml-auto hover:opacity-90"
                      onClick={handleSubmit}
                      disabled={loading}
                      size="lg"
                      style={{ backgroundColor: '#e6941f', color: '#073045' }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay ₦5,000 & Submit Application
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      {step < 4 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#073045' }}>
                Why Join Edumentor as a Tutor?
              </h2>
              <p className="text-xl text-gray-600 max-w-[800px] mx-auto">
                Experience the benefits of teaching with Nigeria's premier educational platform
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#1d636c' }}>
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Competitive Earnings</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Earn ₦15,000 - ₦50,000 monthly with our competitive commission structure and flexible rates.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#e6941f' }}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#e6941f' }}>
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Flexible Schedule</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Set your own hours and teach around your NYSC duties or other commitments.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#073045' }}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#073045' }}>
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Verified Platform</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We handle payments, scheduling, and student matching so you can focus on teaching.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#1d636c' }}>
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Student Matching</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get matched with students based on your expertise, location, and availability.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#e6941f' }}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#e6941f' }}>
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Teaching Resources</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Access comprehensive teaching materials, past questions, and curriculum guides.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#073045' }}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#073045' }}>
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Professional Growth</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Develop teaching skills, build your portfolio, and gain valuable experience.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
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

// Badge Component
function Badge({ variant, className, children, style }: any) {
  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`} style={style}>
      {children}
    </div>
  );
}

// Step 1: Registration (for new tutors)
function RegistrationStep({ registrationData, handleRegistrationInputChange, loading }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e6941f' }}>
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>Create Your Tutor Account</h3>
        <p className="text-muted-foreground mt-2">
          Create an account to start your tutor application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="regFirstName" className="font-semibold" style={{ color: '#073045' }}>
            First Name *
          </Label>
          <Input 
            id="regFirstName" 
            placeholder="Enter your first name" 
            required 
            value={registrationData.firstName}
            onChange={(e) => handleRegistrationInputChange('firstName', e.target.value)}
            disabled={loading}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="regLastName" className="font-semibold" style={{ color: '#073045' }}>
            Last Name *
          </Label>
          <Input 
            id="regLastName" 
            placeholder="Enter your last name" 
            required 
            value={registrationData.lastName}
            onChange={(e) => handleRegistrationInputChange('lastName', e.target.value)}
            disabled={loading}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="regEmail" className="font-semibold" style={{ color: '#073045' }}>
          Email Address *
        </Label>
        <Input 
          id="regEmail" 
          type="email" 
          placeholder="your.email@example.com" 
          required 
          value={registrationData.email}
          onChange={(e) => handleRegistrationInputChange('email', e.target.value)}
          disabled={loading}
          className="h-12 border-2 focus:border-opacity-50"
          style={{ borderColor: '#e5e7eb' }}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="regPhone" className="font-semibold" style={{ color: '#073045' }}>
          Phone Number *
        </Label>
        <Input 
          id="regPhone" 
          placeholder="+234 xxx xxx xxxx" 
          required 
          value={registrationData.phone}
          onChange={(e) => handleRegistrationInputChange('phone', e.target.value)}
          disabled={loading}
          className="h-12 border-2 focus:border-opacity-50"
          style={{ borderColor: '#e5e7eb' }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="regPassword" className="font-semibold" style={{ color: '#073045' }}>
            Password *
          </Label>
          <Input 
            id="regPassword" 
            type="password" 
            placeholder="Create a password (min 6 characters)" 
            required 
            value={registrationData.password}
            onChange={(e) => handleRegistrationInputChange('password', e.target.value)}
            disabled={loading}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="regConfirmPassword" className="font-semibold" style={{ color: '#073045' }}>
            Confirm Password *
          </Label>
          <Input 
            id="regConfirmPassword" 
            type="password" 
            placeholder="Confirm your password" 
            required 
            value={registrationData.confirmPassword}
            onChange={(e) => handleRegistrationInputChange('confirmPassword', e.target.value)}
            disabled={loading}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
      </div>

      <div className="flex items-start space-x-3 bg-yellow-50 p-4 rounded-lg">
        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#e6941f' }} />
        <div>
          <p className="text-sm text-gray-700 font-medium">Application Fee: ₦5,000</p>
          <p className="text-xs text-gray-600 mt-1">
            This one-time fee covers verification and platform access. Fee is non-refundable after application submission.
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox 
          id="regTerms" 
          required 
          disabled={loading}
          className="mt-1 border-2"
          style={{ borderColor: '#1d636c' }}
        />
        <Label htmlFor="regTerms" className="text-sm cursor-pointer">
          I agree to the{" "}
          <Link href="/terms" className="font-semibold hover:underline" style={{ color: '#1d636c' }} target="_blank">
            Terms and Conditions
          </Link>{" "}
          and understand there's a ₦5,000 application fee
        </Label>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#1d636c' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

// Step 2: Personal Information
function PersonalInfoStep({ formData, handleInputChange }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1d636c' }}>
          <UserCheck className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>Personal Information</h3>
        <p className="text-muted-foreground mt-2">
          Tell us about yourself
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="firstName" className="font-semibold" style={{ color: '#073045' }}>
            First Name *
          </Label>
          <Input 
            id="firstName" 
            placeholder="Enter your first name" 
            required 
            value={formData.personalInfo.firstName}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="lastName" className="font-semibold" style={{ color: '#073045' }}>
            Last Name *
          </Label>
          <Input 
            id="lastName" 
            placeholder="Enter your last name" 
            required 
            value={formData.personalInfo.lastName}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="email" className="font-semibold" style={{ color: '#073045' }}>
            Email Address *
          </Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your.email@example.com" 
            required 
            value={formData.personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="phone" className="font-semibold" style={{ color: '#073045' }}>
            Phone Number *
          </Label>
          <Input 
            id="phone" 
            placeholder="+234 xxx xxx xxxx" 
            required 
            value={formData.personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <Label htmlFor="dateOfBirth" className="font-semibold" style={{ color: '#073045' }}>
            Date of Birth *
          </Label>
          <Input 
            id="dateOfBirth" 
            type="date" 
            required 
            value={formData.personalInfo.dateOfBirth}
            onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="gender" className="font-semibold" style={{ color: '#073045' }}>
            Gender *
          </Label>
          <Select 
            value={formData.personalInfo.gender}
            onValueChange={(value) => handleInputChange('personalInfo', 'gender', value)}
          >
            <SelectTrigger className="h-12 border-2 focus:border-opacity-50" style={{ borderColor: '#e5e7eb' }}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label htmlFor="stateOfOrigin" className="font-semibold" style={{ color: '#073045' }}>
            State of Origin *
          </Label>
          <Select 
            value={formData.personalInfo.stateOfOrigin}
            onValueChange={(value) => handleInputChange('personalInfo', 'stateOfOrigin', value)}
          >
            <SelectTrigger className="h-12 border-2 focus:border-opacity-50" style={{ borderColor: '#e5e7eb' }}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {nigerianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="currentLocation" className="font-semibold" style={{ color: '#073045' }}>
            Current Location *
          </Label>
          <Select 
            value={formData.personalInfo.currentLocation}
            onValueChange={(value) => handleInputChange('personalInfo', 'currentLocation', value)}
          >
            <SelectTrigger className="h-12 border-2 focus:border-opacity-50" style={{ borderColor: '#e5e7eb' }}>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {nigerianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label htmlFor="address" className="font-semibold" style={{ color: '#073045' }}>
            Full Address
          </Label>
          <Input 
            id="address" 
            placeholder="Your complete address" 
            value={formData.personalInfo.address}
            onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Education & Teaching (Combined)
function EducationAndTeachingStep({ 
  formData, 
  handleInputChange,
  handleSubjectToggle,
  handlePackageToggle,
  handleFileUpload,
  uploadProgress 
}: any) {
  return (
    <div className="space-y-10">
      {/* Education Section */}
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#073045' }}>
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>Educational Background</h3>
          <p className="text-muted-foreground mt-2">
            Tell us about your academic qualifications
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="university" className="font-semibold" style={{ color: '#073045' }}>
              University/Institution *
            </Label>
            <Input 
              id="university" 
              placeholder="Your university name" 
              required 
              value={formData.education.university}
              onChange={(e) => handleInputChange('education', 'university', e.target.value)}
              className="h-12 border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="degree" className="font-semibold" style={{ color: '#073045' }}>
              Degree *
            </Label>
            <Select 
              value={formData.education.degree}
              onValueChange={(value) => handleInputChange('education', 'degree', value)}
            >
              <SelectTrigger className="h-12 border-2 focus:border-opacity-50" style={{ borderColor: '#e5e7eb' }}>
                <SelectValue placeholder="Select degree" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B.Sc">Bachelor of Science (B.Sc)</SelectItem>
                <SelectItem value="B.A">Bachelor of Arts (B.A)</SelectItem>
                <SelectItem value="B.Tech">Bachelor of Technology (B.Tech)</SelectItem>
                <SelectItem value="B.Ed">Bachelor of Education (B.Ed)</SelectItem>
                <SelectItem value="MBBS">Medicine (MBBS)</SelectItem>
                <SelectItem value="LLB">Law (LLB)</SelectItem>
                <SelectItem value="B.Eng">Bachelor of Engineering (B.Eng)</SelectItem>
                <SelectItem value="B.Pharm">Pharmacy (B.Pharm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <Label htmlFor="discipline" className="font-semibold" style={{ color: '#073045' }}>
              Field of Study *
            </Label>
            <Input 
              id="discipline" 
              placeholder="e.g., Computer Science" 
              required 
              value={formData.education.discipline}
              onChange={(e) => handleInputChange('education', 'discipline', e.target.value)}
              className="h-12 border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="graduationYear" className="font-semibold" style={{ color: '#073045' }}>
              Graduation Year *
            </Label>
            <Select 
              value={formData.education.graduationYear}
              onValueChange={(value) => handleInputChange('education', 'graduationYear', value)}
            >
              <SelectTrigger className="h-12 border-2 focus:border-opacity-50" style={{ borderColor: '#e5e7eb' }}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="cgpa" className="font-semibold" style={{ color: '#073045' }}>
              CGPA *
            </Label>
            <Input 
              id="cgpa" 
              placeholder="e.g., 4.50" 
              required 
              value={formData.education.cgpa}
              onChange={(e) => handleInputChange('education', 'cgpa', e.target.value)}
              className="h-12 border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            />
          </div>
        </div>
      </div>

      {/* NYSC Section */}
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1d636c' }}>
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>NYSC Information</h3>
          <p className="text-muted-foreground mt-2">
            Required for NYSC corps members
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="deploymentNumber" className="font-semibold" style={{ color: '#073045' }}>
              Deployment Number *
            </Label>
            <Input 
              id="deploymentNumber" 
              placeholder="e.g., NY/24A/xxxx" 
              required 
              value={formData.nysc.deploymentNumber}
              onChange={(e) => handleInputChange('nysc', 'deploymentNumber', e.target.value)}
              className="h-12 border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="callUpNumber" className="font-semibold" style={{ color: '#073045' }}>
              Call-Up Number *
            </Label>
            <Input 
              id="callUpNumber" 
              placeholder="Your NYSC call-up number" 
              required 
              value={formData.nysc.callUpNumber}
              onChange={(e) => handleInputChange('nysc', 'callUpNumber', e.target.value)}
              className="h-12 border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="stateOfDeployment" className="font-semibold" style={{ color: '#073045' }}>
              State of Deployment *
            </Label>
            <Select 
              value={formData.nysc.stateOfDeployment}
              onValueChange={(value) => handleInputChange('nysc', 'stateOfDeployment', value)}
            >
              <SelectTrigger className="h-12 border-2 focus:border-opacity-50" style={{ borderColor: '#e5e7eb' }}>
                <SelectValue placeholder="Select deployment state" />
              </SelectTrigger>
              <SelectContent>
                {nigerianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="batchYear" className="font-semibold" style={{ color: '#073045' }}>
              Batch Year *
            </Label>
            <Select 
              value={formData.nysc.batchYear}
              onValueChange={(value) => handleInputChange('nysc', 'batchYear', value)}
            >
              <SelectTrigger className="h-12 border-2 focus:border-opacity-50" style={{ borderColor: '#e5e7eb' }}>
                <SelectValue placeholder="Select batch year" />
              </SelectTrigger>
              <SelectContent>
                {["2024", "2023", "2022", "2021", "2020"].map(year => (
                  <SelectItem key={year} value={year}>
                    {year} Batch
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="ppa" className="font-semibold" style={{ color: '#073045' }}>
            Place of Primary Assignment (PPA) *
          </Label>
          <Input 
            id="ppa" 
            placeholder="Your current PPA" 
            required 
            value={formData.nysc.ppa}
            onChange={(e) => handleInputChange('nysc', 'ppa', e.target.value)}
            className="h-12 border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
        </div>
      </div>

      {/* Teaching Preferences */}
      <div className="space-y-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e6941f' }}>
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>Teaching Preferences</h3>
          <p className="text-muted-foreground mt-2">
            Tell us what and how you want to teach
          </p>
        </div>
        
        {/* Subjects Section */}
        <div className="space-y-4">
          <Label className="font-semibold text-lg" style={{ color: '#073045' }}>Subjects You Can Teach *</Label>
          <p className="text-sm text-gray-600 mb-4">Select all subjects you're qualified to teach</p>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox 
                  id={`subject-${subject}`}
                  checked={formData.teaching.subjects.includes(subject)}
                  onCheckedChange={() => handleSubjectToggle(subject)}
                  className="border-2"
                  style={{ borderColor: '#1d636c' }}
                />
                <Label 
                  htmlFor={`subject-${subject}`} 
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: '#073045' }}
                >
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Packages Section */}
        <div className="space-y-4">
          <Label className="font-semibold text-lg" style={{ color: '#073045' }}>Exam Packages *</Label>
          <p className="text-sm text-gray-600 mb-4">Select exam packages you can prepare students for</p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg} className="flex items-center space-x-2">
                <Checkbox 
                  id={`package-${pkg}`}
                  checked={formData.teaching.packages.includes(pkg)}
                  onCheckedChange={() => handlePackageToggle(pkg)}
                  className="border-2"
                  style={{ borderColor: '#1d636c' }}
                />
                <Label 
                  htmlFor={`package-${pkg}`} 
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: '#073045' }}
                >
                  {pkg}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Teaching Details */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="experience" className="font-semibold" style={{ color: '#073045' }}>
                Teaching Experience *
              </Label>
              <Select 
                value={formData.teaching.experience}
                onValueChange={(value) => handleInputChange('teaching', 'experience', value)}
              >
                <SelectTrigger className="h-12 border-2 focus:border-opacity-50" style={{ borderColor: '#e5e7eb' }}>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No formal experience</SelectItem>
                  <SelectItem value="1-2">1-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="preferredMode" className="font-semibold" style={{ color: '#073045' }}>
                Preferred Teaching Mode *
              </Label>
              <Select 
                value={formData.teaching.preferredMode}
                onValueChange={(value) => handleInputChange('teaching', 'preferredMode', value)}
              >
                <SelectTrigger className="h-12 border-2 focus:border-opacity-50" style={{ borderColor: '#e5e7eb' }}>
                  <SelectValue placeholder="Select teaching mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Only</SelectItem>
                  <SelectItem value="physical">Physical Only</SelectItem>
                  <SelectItem value="both">Both Online & Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="hourlyRate" className="font-semibold" style={{ color: '#073045' }}>
                Hourly Rate (₦) *
              </Label>
              <Input 
                id="hourlyRate" 
                type="number" 
                placeholder="2500" 
                required 
                value={formData.teaching.hourlyRate}
                onChange={(e) => handleInputChange('teaching', 'hourlyRate', e.target.value)}
                className="h-12 border-2 focus:border-opacity-50"
                style={{ borderColor: '#e5e7eb' }}
              />
              <p className="text-sm text-gray-600">
                Recommended: ₦2,000 - ₦5,000 per hour
              </p>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold" style={{ color: '#073045' }}>
                Availability *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {["Weekday Mornings", "Weekday Afternoons", "Weekday Evenings", "Weekends"].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`availability-${time}`}
                      checked={formData.teaching.availability.includes(time)}
                      onCheckedChange={() => {
                        const newAvailability = formData.teaching.availability.includes(time)
                          ? formData.teaching.availability.filter((t: string) => t !== time)
                          : [...formData.teaching.availability, time];
                        handleInputChange('teaching', 'availability', newAvailability);
                      }}
                      className="border-2"
                      style={{ borderColor: '#1d636c' }}
                    />
                    <Label htmlFor={`availability-${time}`} className="text-sm font-medium">
                      {time}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h4 className="text-xl font-semibold" style={{ color: '#073045' }}>About You</h4>
            <p className="text-sm text-gray-600">Help students get to know you</p>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="bio" className="font-semibold" style={{ color: '#073045' }}>
              Brief Bio/Introduction *
            </Label>
            <Textarea 
              id="bio"
              placeholder="Tell us about yourself, your teaching experience, and why you want to be a tutor..."
              className="min-h-[120px] border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
              value={formData.teaching.bio}
              onChange={(e) => handleInputChange('teaching', 'bio', e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="teachingPhilosophy" className="font-semibold" style={{ color: '#073045' }}>
              Teaching Philosophy
            </Label>
            <Textarea 
              id="teachingPhilosophy"
              placeholder="Describe your teaching approach and methodology..."
              className="min-h-[120px] border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
              value={formData.teaching.teachingPhilosophy}
              onChange={(e) => handleInputChange('teaching', 'teachingPhilosophy', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div className="space-y-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#073045' }}>
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>Document Upload</h3>
          <p className="text-muted-foreground mt-2">
            Upload required documents for verification
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="profilePhoto" className="font-semibold" style={{ color: '#073045' }}>
              Profile Photo * 
              <span className="text-gray-600 text-sm ml-2">(Passport, max 2MB)</span>
            </Label>
            <Input 
              id="profilePhoto" 
              type="file" 
              accept="image/*"
              required
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('profilePhoto', file);
              }}
              className="border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            />
            {uploadProgress.profilePhoto > 0 && uploadProgress.profilePhoto < 100 && (
              <Progress value={uploadProgress.profilePhoto} className="h-2 mt-2" style={{ backgroundColor: '#e5e7eb' }} />
            )}
            {formData.documents.profilePhoto && (
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle className="h-4 w-4" style={{ color: '#10b981' }} />
                <span className="text-sm font-medium" style={{ color: '#10b981' }}>Uploaded ✓</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="certificate" className="font-semibold" style={{ color: '#073045' }}>
              University Certificate * 
              <span className="text-gray-600 text-sm ml-2">(PDF/Image, max 5MB)</span>
            </Label>
            <Input 
              id="certificate" 
              type="file" 
              accept="image/*,application/pdf"
              required
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('certificate', file);
              }}
              className="border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            />
            {uploadProgress.certificate > 0 && uploadProgress.certificate < 100 && (
              <Progress value={uploadProgress.certificate} className="h-2 mt-2" style={{ backgroundColor: '#e5e7eb' }} />
            )}
            {formData.documents.certificate && (
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle className="h-4 w-4" style={{ color: '#10b981' }} />
                <span className="text-sm font-medium" style={{ color: '#10b981' }}>Uploaded ✓</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="nyscIdFront" className="font-semibold" style={{ color: '#073045' }}>
              NYSC ID Card (Front) * 
              <span className="text-gray-600 text-sm ml-2">(Image, max 3MB)</span>
            </Label>
            <Input 
              id="nyscIdFront" 
              type="file" 
              accept="image/*"
              required
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('nyscIdFront', file);
              }}
              className="border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            />
            {uploadProgress.nyscIdFront > 0 && uploadProgress.nyscIdFront < 100 && (
              <Progress value={uploadProgress.nyscIdFront} className="h-2 mt-2" style={{ backgroundColor: '#e5e7eb' }} />
            )}
            {formData.documents.nyscIdFront && (
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle className="h-4 w-4" style={{ color: '#10b981' }} />
                <span className="text-sm font-medium" style={{ color: '#10b981' }}>Uploaded ✓</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="nyscIdBack" className="font-semibold" style={{ color: '#073045' }}>
              NYSC ID Card (Back) * 
              <span className="text-gray-600 text-sm ml-2">(Image, max 3MB)</span>
            </Label>
            <Input 
              id="nyscIdBack" 
              type="file" 
              accept="image/*"
              required
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('nyscIdBack', file);
              }}
              className="border-2 focus:border-opacity-50"
              style={{ borderColor: '#e5e7eb' }}
            />
            {uploadProgress.nyscIdBack > 0 && uploadProgress.nyscIdBack < 100 && (
              <Progress value={uploadProgress.nyscIdBack} className="h-2 mt-2" style={{ backgroundColor: '#e5e7eb' }} />
            )}
            {formData.documents.nyscIdBack && (
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle className="h-4 w-4" style={{ color: '#10b981' }} />
                <span className="text-sm font-medium" style={{ color: '#10b981' }}>Uploaded ✓</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="cv" className="font-semibold" style={{ color: '#073045' }}>
            Curriculum Vitae (CV) 
            <span className="text-gray-600 text-sm ml-2">(PDF, max 3MB, optional)</span>
          </Label>
          <Input 
            id="cv" 
            type="file" 
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload('cv', file);
            }}
            className="border-2 focus:border-opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          />
          {uploadProgress.cv > 0 && uploadProgress.cv < 100 && (
            <Progress value={uploadProgress.cv} className="h-2 mt-2" style={{ backgroundColor: '#e5e7eb' }} />
          )}
          {formData.documents.cv && (
            <div className="flex items-center space-x-2 mt-2">
              <CheckCircle className="h-4 w-4" style={{ color: '#10b981' }} />
              <span className="text-sm font-medium" style={{ color: '#10b981' }}>Uploaded ✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-6 border-t pt-8">
        <div className="text-center">
          <h4 className="text-xl font-semibold mb-4" style={{ color: '#073045' }}>Final Steps</h4>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#1d636c' }} />
            <div>
              <p className="font-medium text-gray-900">Application Fee: ₦5,000</p>
              <p className="text-sm text-gray-600 mt-1">
                This one-time fee covers comprehensive verification, platform access, and training materials. 
                Fee is non-refundable after application submission.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#1d636c' }} />
            <div>
              <p className="font-medium text-gray-900">Verification Process</p>
              <p className="text-sm text-gray-600 mt-1">
                Your application will be reviewed within 2-3 business days. All documents are verified for authenticity.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms" 
              required
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => 
                handleInputChange('termsAccepted', '', checked)
              }
              className="mt-1 border-2"
              style={{ borderColor: '#1d636c' }}
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              I agree to the{" "}
              <Link href="/terms" className="font-semibold hover:underline" style={{ color: '#1d636c' }} target="_blank">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold hover:underline" style={{ color: '#1d636c' }} target="_blank">
                Privacy Policy
              </Link>
            </Label>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="verification" 
              required
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => 
                handleInputChange('termsAccepted', '', checked)
              }
              className="mt-1 border-2"
              style={{ borderColor: '#1d636c' }}
            />
            <Label htmlFor="verification" className="text-sm cursor-pointer">
              I confirm that all information provided is accurate and I consent to verification of my documents. 
              I understand that providing false information may lead to termination of my account.
              I understand there's a non-refundable ₦5,000 application fee.
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Confirmation
function ConfirmationStep() {
  return (
    <div className="text-center space-y-8 py-12">
      <div className="space-y-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#d1fae5' }}>
          <CheckCircle className="h-12 w-12" style={{ color: '#10b981' }} />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-3xl font-bold" style={{ color: '#073045' }}>Application Submitted Successfully!</h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Thank you for applying to become an Edumentor tutor. Your application is now under review.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-gray-50 p-8 rounded-xl space-y-4 text-left" style={{ border: '2px solid #e5e7eb' }}>
          <div className="flex justify-between items-center pb-4 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
            <span className="font-medium text-gray-700">Application ID</span>
            <span className="font-mono font-semibold text-lg" style={{ color: '#073045' }}>TUT-{Date.now().toString().slice(-8)}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
            <span className="font-medium text-gray-700">Payment Status</span>
            <span className="font-medium text-lg" style={{ color: '#10b981' }}>✓ Completed</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b" style={{ borderBottomColor: '#e5e7eb' }}>
            <span className="font-medium text-gray-700">Application Status</span>
            <span className="font-medium text-lg" style={{ color: '#1d636c' }}>Under Review</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Estimated Review Time</span>
            <span className="font-medium text-lg" style={{ color: '#073045' }}>2-3 Business Days</span>
          </div>
        </div>

        <div className="bg-blue-50 p-8 rounded-xl" style={{ border: '2px solid #dbeafe' }}>
          <h4 className="font-semibold text-xl mb-4 text-center" style={{ color: '#073045' }}>What happens next?</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1d636c' }}>
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Document Verification</p>
                <p className="text-sm text-gray-600 mt-1">We'll verify all your uploaded documents</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1d636c' }}>
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Approval Notification</p>
                <p className="text-sm text-gray-600 mt-1">You'll receive an email once approved</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1d636c' }}>
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Profile Setup</p>
                <p className="text-sm text-gray-600 mt-1">Complete your tutor profile</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1d636c' }}>
                <span className="text-white font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Start Teaching</p>
                <p className="text-sm text-gray-600 mt-1">Begin receiving booking requests</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Link href="/tutor-dashboard">
            <Button 
              size="lg" 
              className="w-full hover:opacity-90"
              style={{ backgroundColor: '#1d636c', color: 'white' }}
            >
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full border-2 hover:opacity-80"
              style={{ borderColor: '#e6941f', color: '#e6941f' }}
            >
              Return to Home
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-600">
          Questions? Contact us at{" "}
          <a href="mailto:support@edumentor.com" className="font-semibold hover:underline" style={{ color: '#1d636c' }}>
            support@edumentor.com
          </a>
        </p>
      </div>
    </div>
  );
}