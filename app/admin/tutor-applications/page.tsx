'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Download,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  getAllTutorApplications,
  getTutorApplication,
  updateTutorApplication,
  approveTutorApplication,
} from "@/lib/firebase/firestore";

interface TutorApplication {
  id: string;
  userId: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  phone: string;
  personalInfo?: {
    dateOfBirth: string;
    gender: string;
    stateOfOrigin: string;
    currentLocation: string;
    address: string;
  };
  nysc?: {
    deploymentNumber: string;
    stateOfDeployment: string;
    ppa: string;
    batchYear: string;
    callUpNumber: string;
  };
  education?: {
    university: string;
    degree: string;
    graduationYear: string;
    cgpa: string;
    discipline: string;
  };
  teaching?: {
    subjects: string[];
    packages: string[];
    experience: string;
    preferredMode: string;
    availability: string[];
    hourlyRate: string;
    bio: string;
    teachingPhilosophy: string;
  };
  documents?: {
    profilePhoto?: { url: string; name: string };
    nyscIdFront?: { url: string; name: string };
    nyscIdBack?: { url: string; name: string };
    certificate?: { url: string; name: string };
    cv?: { url: string; name: string };
  };
  payment?: {
    amount: number;
    reference: string;
    status: string;
  };
  status: string;
  applicationDate: string;
  termsAccepted: boolean;
  reviewerNotes?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
}

// Helper function to safely access nested properties
const getNestedValue = (obj: any, path: string, defaultValue: any = 'N/A') => {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return result || defaultValue;
};

export default function AdminTutorApplicationsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
  

   

    loadApplications();
  }, [user, userData, router]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const apps = await getAllTutorApplications();
      
      // Ensure all applications have required properties
      const validatedApps = (apps || []).map((app: any) => ({
        id: app.id || '',
        userId: app.userId || '',
        userEmail: app.userEmail || app.email || 'No email',
        firstName: app.firstName || app.personalInfo?.firstName || 'Unknown',
        lastName: app.lastName || app.personalInfo?.lastName || 'Unknown',
        phone: app.phone || app.personalInfo?.phone || 'No phone',
        personalInfo: app.personalInfo || {},
        nysc: app.nysc || {},
        education: app.education || {
          university: 'Not provided',
          degree: 'Not provided',
          graduationYear: 'Not provided',
          cgpa: 'Not provided',
          discipline: 'Not provided'
        },
        teaching: app.teaching || {
          subjects: [],
          packages: [],
          experience: 'Not specified',
          preferredMode: 'Not specified',
          availability: [],
          hourlyRate: '0',
          bio: '',
          teachingPhilosophy: ''
        },
        documents: app.documents || {},
        payment: app.payment || {
          amount: 0,
          reference: 'No reference',
          status: 'unknown'
        },
        status: app.status || 'unknown',
        applicationDate: app.applicationDate || app.createdAt || new Date().toISOString(),
        termsAccepted: app.termsAccepted || false,
        reviewerNotes: app.reviewerNotes || [],
        reviewedBy: app.reviewedBy,
        reviewedAt: app.reviewedAt
      }));
      
      setApplications(validatedApps);
      setFilteredApplications(validatedApps);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  // Filter applications based on search and status
  useEffect(() => {
    let filtered = [...applications];

    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        (app.firstName?.toLowerCase() || '').includes(term) ||
        (app.lastName?.toLowerCase() || '').includes(term) ||
        (app.userEmail?.toLowerCase() || '').includes(term) ||
        (app.phone || '').includes(term) ||
        (getNestedValue(app, 'education.university', '').toLowerCase()).includes(term)
      );
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Payment</Badge>;
      case "pending_review":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending Review</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleViewDetails = async (applicationId: string) => {
    try {
      const app = await getTutorApplication(applicationId);
      if (app) {
        // Validate and structure the application data
        const validatedApp: TutorApplication = {
          id: app.id || '',
          userId: app.userId || '',
          userEmail: app.userEmail || app.email || 'No email',
          firstName: app.firstName || app.personalInfo?.firstName || 'Unknown',
          lastName: app.lastName || app.personalInfo?.lastName || 'Unknown',
          phone: app.phone || app.personalInfo?.phone || 'No phone',
          personalInfo: app.personalInfo || {},
          nysc: app.nysc || {},
          education: app.education || {
            university: 'Not provided',
            degree: 'Not provided',
            graduationYear: 'Not provided',
            cgpa: 'Not provided',
            discipline: 'Not provided'
          },
          teaching: app.teaching || {
            subjects: [],
            packages: [],
            experience: 'Not specified',
            preferredMode: 'Not specified',
            availability: [],
            hourlyRate: '0',
            bio: '',
            teachingPhilosophy: ''
          },
          documents: app.documents || {},
          payment: app.payment || {
            amount: 0,
            reference: 'No reference',
            status: 'unknown'
          },
          status: app.status || 'unknown',
          applicationDate: app.applicationDate || app.createdAt || new Date().toISOString(),
          termsAccepted: app.termsAccepted || false,
          reviewerNotes: app.reviewerNotes || [],
          reviewedBy: app.reviewedBy,
          reviewedAt: app.reviewedAt
        };
        
        setSelectedApplication(validatedApp);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Error loading application details:", error);
      toast.error("Failed to load application details");
    }
  };

  const handleApprove = async (applicationId: string) => {
    if (!selectedApplication) return;

    setActionLoading("approve");
    try {
      // Use the approveTutorApplication function which creates tutor in tutors collection
      const result = await approveTutorApplication(applicationId);
      
      if (result.success) {
        // Update application status to approved
        await updateTutorApplication(applicationId, {
          status: "approved",
          reviewedBy: user?.uid,
          reviewedAt: new Date().toISOString(),
          reviewerNotes: adminNotes ? [adminNotes] : [],
        });

        toast.success("Tutor application approved successfully!");
        
        // Refresh applications list
        await loadApplications();
        
        // Close modals
        setIsApproveModalOpen(false);
        setIsDetailModalOpen(false);
        setAdminNotes("");
      } else {
        throw new Error("Failed to create tutor");
      }
    } catch (error: any) {
      console.error("Error approving application:", error);
      toast.error(`Failed to approve application: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setActionLoading("reject");
    try {
      await updateTutorApplication(applicationId, {
        status: "rejected",
        reviewerNotes: [rejectionReason],
        reviewedBy: user?.uid,
        reviewedAt: new Date().toISOString(),
      });

      toast.success("Application rejected successfully!");
      
      // Refresh applications list
      await loadApplications();
      
      // Close modals and reset
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
      setRejectionReason("");
    } catch (error: any) {
      console.error("Error rejecting application:", error);
      toast.error(`Failed to reject application: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestRevision = async (applicationId: string, notes: string) => {
    if (!notes.trim()) {
      toast.error("Please provide revision notes");
      return;
    }

    setActionLoading("revision");
    try {
      await updateTutorApplication(applicationId, {
        status: "pending_revision",
        reviewerNotes: [notes],
        reviewedBy: user?.uid,
        reviewedAt: new Date().toISOString(),
      });

      toast.success("Revision requested successfully!");
      setIsDetailModalOpen(false);
      setAdminNotes("");
      await loadApplications();
    } catch (error: any) {
      console.error("Error requesting revision:", error);
      toast.error(`Failed to request revision: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStats = () => {
    const total = applications.length;
    const pendingReview = applications.filter(app => app.status === "pending_review").length;
    const approved = applications.filter(app => app.status === "approved").length;
    const rejected = applications.filter(app => app.status === "rejected").length;
    const pendingPayment = applications.filter(app => app.status === "pending_payment").length;

    return { total, pendingReview, approved, rejected, pendingPayment };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Edumentor Admin</h1>
              <p className="text-sm text-muted-foreground">Tutor Applications Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadApplications}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Overview */}
        <div className="grid gap-4 mb-8 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
              <CardDescription className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Total Applications
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-yellow-600">{stats.pendingPayment}</CardTitle>
              <CardDescription className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending Payment
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-blue-600">{stats.pendingReview}</CardTitle>
              <CardDescription className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Pending Review
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-green-600">{stats.approved}</CardTitle>
              <CardDescription className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approved
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-red-600">{stats.rejected}</CardTitle>
              <CardDescription className="flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, university..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_payment">Pending Payment</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="pending_revision">Pending Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tutor Applications</CardTitle>
            <CardDescription>
              Showing {filteredApplications.length} of {applications.length} applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                <p className="text-muted-foreground">
                  {applications.length === 0
                    ? "No tutor applications have been submitted yet."
                    : "No applications match your filters."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">
                              {application.firstName} {application.lastName}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {application.userEmail}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {application.phone}
                            </div>
                            <div className="flex items-center">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {getNestedValue(application, 'education.university', 'Not provided')}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {getNestedValue(application, 'nysc.stateOfDeployment', getNestedValue(application, 'personalInfo.currentLocation', 'Not specified'))}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Subjects: </span>
                            {getNestedValue(application, 'teaching.subjects', []).slice(0, 3).join(", ")}
                            {getNestedValue(application, 'teaching.subjects', []).length > 3 && "..."}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(application.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          
                          {application.status === "pending_review" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setIsApproveModalOpen(true);
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setIsRejectModalOpen(true);
                                }}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs text-muted-foreground flex justify-between">
                        <span>
                          Applied: {new Date(application.applicationDate).toLocaleDateString()}
                        </span>
                        <span>
                          ID: {application.id.slice(0, 8)}...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Application Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Application Details</span>
                  {getStatusBadge(selectedApplication.status)}
                </DialogTitle>
                <DialogDescription>
                  Review all details before making a decision
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="education">Education & NYSC</TabsTrigger>
                  <TabsTrigger value="teaching">Teaching</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Full Name</Label>
                      <p className="font-medium">
                        {selectedApplication.firstName} {selectedApplication.lastName}
                      </p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{selectedApplication.userEmail}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <p className="font-medium">
                        {getNestedValue(selectedApplication, 'personalInfo.dateOfBirth', 'Not provided')}
                      </p>
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <p className="font-medium">{getNestedValue(selectedApplication, 'personalInfo.gender', 'Not specified')}</p>
                    </div>
                    <div>
                      <Label>State of Origin</Label>
                      <p className="font-medium">{getNestedValue(selectedApplication, 'personalInfo.stateOfOrigin', 'Not specified')}</p>
                    </div>
                    <div>
                      <Label>Current Location</Label>
                      <p className="font-medium">{getNestedValue(selectedApplication, 'personalInfo.currentLocation', 'Not specified')}</p>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <p className="font-medium">
                        {getNestedValue(selectedApplication, 'personalInfo.address', 'Not provided')}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="education" className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>University</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'education.university', 'Not provided')}</p>
                      </div>
                      <div>
                        <Label>Degree</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'education.degree', 'Not provided')}</p>
                      </div>
                      <div>
                        <Label>Field of Study</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'education.discipline', 'Not provided')}</p>
                      </div>
                      <div>
                        <Label>Graduation Year</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'education.graduationYear', 'Not provided')}</p>
                      </div>
                      <div>
                        <Label>CGPA</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'education.cgpa', 'Not provided')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      NYSC Information
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Deployment Number</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'nysc.deploymentNumber', 'Not provided')}</p>
                      </div>
                      <div>
                        <Label>Call-Up Number</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'nysc.callUpNumber', 'Not provided')}</p>
                      </div>
                      <div>
                        <Label>State of Deployment</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'nysc.stateOfDeployment', 'Not provided')}</p>
                      </div>
                      <div>
                        <Label>Batch Year</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'nysc.batchYear', 'Not provided')}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Place of Primary Assignment (PPA)</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'nysc.ppa', 'Not provided')}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="teaching" className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Teaching Preferences</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Subjects</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getNestedValue(selectedApplication, 'teaching.subjects', []).map((subject: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Exam Packages</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getNestedValue(selectedApplication, 'teaching.packages', []).map((pkg: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {pkg}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Experience</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'teaching.experience', 'Not specified')}</p>
                      </div>
                      <div>
                        <Label>Preferred Mode</Label>
                        <p className="font-medium">{getNestedValue(selectedApplication, 'teaching.preferredMode', 'Not specified')}</p>
                      </div>
                      <div>
                        <Label>Hourly Rate</Label>
                        <p className="font-medium">₦{getNestedValue(selectedApplication, 'teaching.hourlyRate', '0')}</p>
                      </div>
                      <div>
                        <Label>Availability</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getNestedValue(selectedApplication, 'teaching.availability', []).map((time: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Bio/Introduction</Label>
                      <p className="mt-1 text-sm whitespace-pre-line">
                        {getNestedValue(selectedApplication, 'teaching.bio', 'Not provided')}
                      </p>
                    </div>
                    <div>
                      <Label>Teaching Philosophy</Label>
                      <p className="mt-1 text-sm whitespace-pre-line">
                        {getNestedValue(selectedApplication, 'teaching.teachingPhilosophy', 'Not provided')}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {getNestedValue(selectedApplication, 'documents.profilePhoto.url') && (
                      <div className="space-y-2">
                        <Label>Profile Photo</Label>
                        <div className="border rounded-lg p-4">
                          <div className="aspect-square w-32 mx-auto overflow-hidden rounded-lg">
                            <img
                              src={getNestedValue(selectedApplication, 'documents.profilePhoto.url')}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-center mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(getNestedValue(selectedApplication, 'documents.profilePhoto.url'), '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {getNestedValue(selectedApplication, 'documents.certificate.url') && (
                      <div className="space-y-2">
                        <Label>Certificate</Label>
                        <div className="border rounded-lg p-4">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div className="text-center mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(getNestedValue(selectedApplication, 'documents.certificate.url'), '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Certificate
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {getNestedValue(selectedApplication, 'documents.nyscIdFront.url') && (
                      <div className="space-y-2">
                        <Label>NYSC ID (Front)</Label>
                        <div className="border rounded-lg p-4">
                          <div className="aspect-video w-full overflow-hidden rounded-lg">
                            <img
                              src={getNestedValue(selectedApplication, 'documents.nyscIdFront.url')}
                              alt="NYSC ID Front"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="text-center mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(getNestedValue(selectedApplication, 'documents.nyscIdFront.url'), '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {getNestedValue(selectedApplication, 'documents.nyscIdBack.url') && (
                      <div className="space-y-2">
                        <Label>NYSC ID (Back)</Label>
                        <div className="border rounded-lg p-4">
                          <div className="aspect-video w-full overflow-hidden rounded-lg">
                            <img
                              src={getNestedValue(selectedApplication, 'documents.nyscIdBack.url')}
                              alt="NYSC ID Back"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="text-center mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(getNestedValue(selectedApplication, 'documents.nyscIdBack.url'), '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {getNestedValue(selectedApplication, 'documents.cv.url') && (
                      <div className="space-y-2">
                        <Label>Curriculum Vitae (CV)</Label>
                        <div className="border rounded-lg p-4">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div className="text-center mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(getNestedValue(selectedApplication, 'documents.cv.url'), '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download CV
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Information</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Payment Status</Label>
                        <Badge
                          variant={
                            getNestedValue(selectedApplication, 'payment.status') === "completed"
                              ? "default"
                              : "outline"
                          }
                          className={
                            getNestedValue(selectedApplication, 'payment.status') === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {getNestedValue(selectedApplication, 'payment.status', 'unknown')}
                        </Badge>
                      </div>
                      <div>
                        <Label>Reference</Label>
                        <p className="font-mono text-sm">{getNestedValue(selectedApplication, 'payment.reference', 'No reference')}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Add notes or comments about this application..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  {selectedApplication.status === "pending_review" && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setIsRejectModalOpen(true);
                          setIsDetailModalOpen(false);
                        }}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRequestRevision(selectedApplication.id, adminNotes)}
                        disabled={!adminNotes.trim() || actionLoading === "revision"}
                      >
                        {actionLoading === "revision" ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-2" />
                        )}
                        Request Revision
                      </Button>
                      <Button
                        onClick={() => {
                          setIsApproveModalOpen(true);
                          setIsDetailModalOpen(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Approve Tutor Application
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this tutor application?
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Approving will:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li>Create a tutor profile in the system</li>
                  <li>Update user role to 'tutor'</li>
                  <li>Make tutor available for bookings</li>
                  <li>Send approval notification to applicant</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Label>Approval Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes for the applicant..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveModalOpen(false);
                setAdminNotes("");
              }}
              disabled={actionLoading === "approve"}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedApplication && handleApprove(selectedApplication.id)}
              disabled={actionLoading === "approve"}
            >
              {actionLoading === "approve" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-600" />
              Reject Tutor Application
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Rejection will notify the applicant and they will need to reapply.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Reason for Rejection *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why this application is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectionReason("");
              }}
              disabled={actionLoading === "reject"}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedApplication && handleReject(selectedApplication.id)}
              disabled={!rejectionReason.trim() || actionLoading === "reject"}
            >
              {actionLoading === "reject" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}