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
  Copy,
  ExternalLink,
  X,
  Link2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { 
  getTutorStats,
  getTutorBookings,
  getMonthlyEarnings,
  getTutorPerformance,
  getActiveStudents
} from "@/lib/firebase/dashboard"
import { 
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { format } from "date-fns"
import { toast } from "react-hot-toast"

// Badge Component
function Badge({ variant, className, children, style }: any) {
  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`} style={style}>
      {children}
    </div>
  );
}

// ==========================================
// PLATFORM CREDENTIALS & CONFIG
// ==========================================

// ==========================================
// CREDENTIALS — loaded from environment variables only.
// Never hardcode secrets in source code.
//
// Add to .env.local (do NOT commit this file):
//   ZOOM_ACCOUNT_ID=your_account_id
//   ZOOM_CLIENT_ID=your_client_id
//   ZOOM_CLIENT_SECRET=your_client_secret       ← server-side only, never NEXT_PUBLIC_
//   NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY=your_api_key
// ==========================================

const ZOOM_CONFIG = {
  accountId: process.env.ZOOM_ACCOUNT_ID ?? '',
  clientId: process.env.ZOOM_CLIENT_ID ?? '',
  // clientSecret is intentionally absent here — only used inside /api/zoom/token (server route)
};

// GOOGLE_CONFIG removed — Google Meet is now created server-side via /api/google-meet
// No API keys or credentials are needed in the frontend.

// ==========================================
// VIDEO MEETING INTERFACES & HELPERS
// ==========================================

interface VideoMeeting {
  id: string;
  title: string;
  description: string;
  subject: string;
  meetingDate: string;
  meetingTime: string;
  duration: number; // in minutes
  meetingLink: string;
  meetingPlatform: 'zoom' | 'google_meet';
  students: string[];
  studentNames: string[];
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  maxParticipants: number;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  notes: string;
  createdAt: any;
  tutorId: string;
  // Platform-specific meeting IDs
  zoomMeetingId?: string;
  googleCalendarEventId?: string;
}

interface MeetingFormData {
  title: string;
  description: string;
  subject: string;
  meetingDate: string;
  meetingTime: string;
  duration: number;
  meetingLink: string;
  meetingPlatform: 'zoom' | 'google_meet';
  selectedStudents: string[];
  maxParticipants: number;
  isRecurring: boolean;
  recurringPattern: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  notes: string;
}

// ==========================================
// ZOOM API INTEGRATION
// ==========================================

/**
 * Gets a Zoom access token by calling YOUR OWN backend API route.
 * The clientSecret never touches the browser — it stays in your server env.
 *
 * Create this route in Next.js: /app/api/zoom/token/route.ts
 *
 *   import { NextResponse } from 'next/server';
 *   export async function POST() {
 *     const credentials = Buffer.from(
 *       `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
 *     ).toString('base64');
 *     const res = await fetch(
 *       `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
 *       { method: 'POST', headers: { Authorization: `Basic ${credentials}` } }
 *     );
 *     const data = await res.json();
 *     return NextResponse.json({ access_token: data.access_token });
 *   }
 */
const getZoomAccessToken = async (): Promise<string | null> => {
  try {
    const res = await fetch('/api/zoom/token', { method: 'POST' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error('Zoom token error:', err);
    return null;
  }
};

/**
 * Creates a Zoom meeting via the Zoom API.
 * Returns { join_url, id } or null on failure.
 */
const createZoomMeeting = async (formData: MeetingFormData): Promise<{ join_url: string; id: string } | null> => {
  try {
    const token = await getZoomAccessToken();
    if (!token) {
      toast.error('Failed to authenticate with Zoom. Using fallback link.');
      return null;
    }

    // Build ISO datetime: meetingDate = "YYYY-MM-DD", meetingTime = "HH:MM"
    const startTime = new Date(`${formData.meetingDate}T${formData.meetingTime}:00`).toISOString();

    const recurrenceMap: Record<string, { type: number; repeat_interval: number }> = {
      daily: { type: 1, repeat_interval: 1 },
      weekly: { type: 2, repeat_interval: 1 },
      biweekly: { type: 2, repeat_interval: 2 },
      monthly: { type: 3, repeat_interval: 1 },
    };

    const body: any = {
      topic: formData.title,
      type: formData.isRecurring ? 8 : 2, // 2 = scheduled, 8 = recurring
      start_time: startTime,
      duration: formData.duration,
      agenda: formData.description || formData.notes,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        auto_recording: 'none',
      },
    };

    if (formData.isRecurring && recurrenceMap[formData.recurringPattern]) {
      body.recurrence = {
        ...recurrenceMap[formData.recurringPattern],
        end_times: 10, // End after 10 occurrences by default
      };
    }

    const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('Zoom create meeting error:', errData);
      return null;
    }

    const data = await res.json();
    return { join_url: data.join_url, id: String(data.id) };
  } catch (err) {
    console.error('Zoom meeting creation error:', err);
    return null;
  }
};

// ==========================================
// GOOGLE MEET INTEGRATION
// ==========================================

/**
 * Creates a Google Meet link by calling your own backend API route.
 * No OAuth popup, no client_id needed on the frontend.
 *
 * Create this route at: /app/api/google-meet/route.ts
 *
 * It uses a Google Service Account to create a Calendar event with a Meet link.
 * Steps to set up (one time):
 *   1. Go to Google Cloud Console → IAM → Service Accounts → Create Service Account
 *   2. Give it the role "Calendar API" or share your Google Calendar with its email
 *   3. Create a JSON key, download it
 *   4. Add these to .env.local:
 *        GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
 *        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *        GOOGLE_CALENDAR_ID=primary   (or a specific calendar ID)
 *
 * Example /app/api/google-meet/route.ts:
 *
 *   import { NextRequest, NextResponse } from 'next/server';
 *   import { google } from 'googleapis';
 *
 *   export async function POST(req: NextRequest) {
 *     const body = await req.json();
 *     const auth = new google.auth.JWT(
 *       process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
 *       undefined,
 *       process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
 *       ['https://www.googleapis.com/auth/calendar.events']
 *     );
 *     const calendar = google.calendar({ version: 'v3', auth });
 *     const event = await calendar.events.insert({
 *       calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
 *       conferenceDataVersion: 1,
 *       requestBody: {
 *         summary: body.title,
 *         description: body.description,
 *         start: { dateTime: body.startTime, timeZone: body.timeZone },
 *         end:   { dateTime: body.endTime,   timeZone: body.timeZone },
 *         conferenceData: {
 *           createRequest: {
 *             requestId: `edumentor-${Date.now()}`,
 *             conferenceSolutionKey: { type: 'hangoutsMeet' },
 *           },
 *         },
 *         ...(body.recurrence ? { recurrence: [body.recurrence] } : {}),
 *       },
 *     });
 *     const meetLink = event.data.conferenceData?.entryPoints
 *       ?.find((ep: any) => ep.entryPointType === 'video')?.uri;
 *     return NextResponse.json({ meet_link: meetLink, event_id: event.data.id });
 *   }
 */
const createGoogleMeetLink = async (formData: MeetingFormData): Promise<{ meet_link: string; event_id: string } | null> => {
  try {
    const startDateTime = new Date(`${formData.meetingDate}T${formData.meetingTime}:00`);
    const endDateTime   = new Date(startDateTime.getTime() + formData.duration * 60000);

    const rruleMap: Record<string, string> = {
      daily:    'RRULE:FREQ=DAILY;COUNT=30',
      weekly:   'RRULE:FREQ=WEEKLY;COUNT=12',
      biweekly: 'RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=12',
      monthly:  'RRULE:FREQ=MONTHLY;COUNT=6',
    };

    const res = await fetch('/api/google-meet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:       formData.title,
        description: formData.description || formData.notes,
        startTime:   startDateTime.toISOString(),
        endTime:     endDateTime.toISOString(),
        timeZone:    Intl.DateTimeFormat().resolvedOptions().timeZone,
        recurrence:  formData.isRecurring ? rruleMap[formData.recurringPattern] : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Google Meet API error:', data);

      if (data.error === 'invalid_grant' || data.error === 'auth_required') {
        toast.error(
          'Google auth expired. Please contact support to reconnect Google Meet.',
          { duration: 6000 }
        );
      } else {
        toast.error(data.message || data.error || 'Failed to create Google Meet link.');
      }
      return null;
    }

    return {
      meet_link: data.meet_link || 'https://meet.google.com/new',
      event_id:  data.event_id  || '',
    };
  } catch (err) {
    console.error('Google Meet creation error:', err);
    return null;
  }
};

// ==========================================
// FALLBACK LINK GENERATORS
// ==========================================

const generateFallbackZoomLink = () => {
  const digits = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
  return `https://zoom.us/j/${digits}`;
};

const generateFallbackGoogleMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const seg = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`;
};

// ==========================================
// PLATFORM CONFIG (only Zoom & Google Meet)
// ==========================================

const platformLabels: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
};

const platformColors: Record<string, string> = {
  zoom: '#2D8CFF',
  google_meet: '#00897B',
};

const platformDescriptions: Record<string, string> = {
  zoom: 'Create via Zoom API',
  google_meet: 'Create via Google Calendar',
};

// ==========================================
// CREATE MEETING MODAL COMPONENT
// ==========================================

function CreateMeetingModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  activeStudents,
  editMeeting,
  isCreating
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: MeetingFormData) => void;
  activeStudents: any[];
  editMeeting?: VideoMeeting | null;
  isCreating: boolean;
}) {
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    subject: '',
    meetingDate: '',
    meetingTime: '',
    duration: 60,
    meetingLink: '',
    meetingPlatform: 'zoom',
    selectedStudents: [],
    maxParticipants: 10,
    isRecurring: false,
    recurringPattern: 'weekly',
    notes: ''
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (editMeeting) {
      setFormData({
        title: editMeeting.title,
        description: editMeeting.description,
        subject: editMeeting.subject,
        meetingDate: editMeeting.meetingDate,
        meetingTime: editMeeting.meetingTime,
        duration: editMeeting.duration,
        meetingLink: editMeeting.meetingLink,
        meetingPlatform: editMeeting.meetingPlatform,
        selectedStudents: editMeeting.students,
        maxParticipants: editMeeting.maxParticipants,
        isRecurring: editMeeting.isRecurring,
        recurringPattern: editMeeting.recurringPattern || 'weekly',
        notes: editMeeting.notes
      });
    } else {
      setFormData({
        title: '',
        description: '',
        subject: '',
        meetingDate: '',
        meetingTime: '',
        duration: 60,
        meetingLink: '',
        meetingPlatform: 'zoom',
        selectedStudents: [],
        maxParticipants: 10,
        isRecurring: false,
        recurringPattern: 'weekly',
        notes: ''
      });
    }
    setStep(1);
  }, [editMeeting, isOpen]);

  const toggleStudent = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };

  const selectAllStudents = () => {
    if (formData.selectedStudents.length === activeStudents.length) {
      setFormData(prev => ({ ...prev, selectedStudents: [] }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        selectedStudents: activeStudents.map(s => s.id) 
      }));
    }
  };

  const isStep1Valid = formData.title && formData.subject && formData.meetingDate && formData.meetingTime;
  const isStep2Valid = true; // Platform always selected
  const isStep3Valid = true;

  const handleSubmit = () => {
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ backgroundColor: '#073045' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editMeeting ? 'Edit Meeting' : 'Create Video Meeting'}
              </h2>
              <p className="text-sm text-gray-300">Step {step} of 3</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isCreating}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  step === s 
                    ? 'text-white' 
                    : step > s 
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-500'
                }`} style={step >= s ? { backgroundColor: '#1d636c' } : {}}>
                  {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                  step === s ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Platform' : 'Invite Students'}
                </span>
                {s < 3 && <div className={`flex-1 h-0.5 mx-3 ${step > s ? 'bg-[#1d636c]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
          
          {/* Step 1: Meeting Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#073045' }}>
                  Meeting Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Mathematics Review Class"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d636c] focus:border-transparent transition-all"
                  style={{ borderColor: '#e5e7eb' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#073045' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what the meeting will cover..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d636c] focus:border-transparent transition-all resize-none"
                  style={{ borderColor: '#e5e7eb' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#073045' }}>
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Mathematics, Physics, English"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d636c] focus:border-transparent transition-all"
                  style={{ borderColor: '#e5e7eb' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#073045' }}>
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d636c] focus:border-transparent transition-all"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#073045' }}>
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingTime: e.target.value }))}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d636c] focus:border-transparent transition-all"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#073045' }}>
                    Duration (minutes)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d636c] focus:border-transparent transition-all bg-white"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1 hour 30 min</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#073045' }}>
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 10 }))}
                    min={1}
                    max={100}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d636c] focus:border-transparent transition-all"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                </div>
              </div>

              {/* Recurring toggle */}
              <div className="p-4 border-2 rounded-xl" style={{ borderColor: '#e5e7eb' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5" style={{ color: '#1d636c' }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#073045' }}>Recurring Meeting</p>
                      <p className="text-xs text-gray-500">Automatically repeat this meeting</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.isRecurring ? 'bg-[#1d636c]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      formData.isRecurring ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                {formData.isRecurring && (
                  <div className="mt-4">
                    <select
                      value={formData.recurringPattern}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurringPattern: e.target.value as any }))}
                      className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d636c] bg-white"
                      style={{ borderColor: '#e5e7eb' }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 Weeks</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Platform Selection */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#073045' }}>
                  Select Meeting Platform
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Choose a platform. The meeting link will be automatically generated using the selected platform's API.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {/* Zoom Option */}
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, meetingPlatform: 'zoom' }))}
                    className={`p-5 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                      formData.meetingPlatform === 'zoom' 
                        ? 'ring-2 ring-offset-2 ring-[#2D8CFF]' 
                        : ''
                    }`}
                    style={{
                      borderColor: formData.meetingPlatform === 'zoom' ? '#2D8CFF' : '#e5e7eb',
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#2D8CFF' }}>
                        <Video className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-base">Zoom</p>
                          {formData.meetingPlatform === 'zoom' && (
                            <CheckCircle className="h-5 w-5" style={{ color: '#2D8CFF' }} />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">Meeting created via Zoom API (Server-to-Server OAuth)</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">HD Video</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Waiting Room</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Up to {formData.maxParticipants} participants</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Google Meet Option */}
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, meetingPlatform: 'google_meet' }))}
                    className={`p-5 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                      formData.meetingPlatform === 'google_meet' 
                        ? 'ring-2 ring-offset-2 ring-[#00897B]' 
                        : ''
                    }`}
                    style={{
                      borderColor: formData.meetingPlatform === 'google_meet' ? '#00897B' : '#e5e7eb',
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#00897B' }}>
                        <Video className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-base">Google Meet</p>
                          {formData.meetingPlatform === 'google_meet' && (
                            <CheckCircle className="h-5 w-5" style={{ color: '#00897B' }} />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">Event & Meet link created via Google Calendar API</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium">Google Calendar</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium">Free</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium">Up to 100 participants</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Info note */}
                <div className="mt-4 p-3 rounded-lg border flex items-start gap-3" style={{ borderColor: '#e6941f', backgroundColor: '#fffbf0' }}>
                  <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#e6941f' }} />
                  <p className="text-xs" style={{ color: '#073045' }}>
                    {formData.meetingPlatform === 'zoom'
                      ? 'A real Zoom meeting will be created using your Zoom account credentials. A unique join link will be generated automatically.'
                      : 'A Google Calendar event with a Google Meet link will be created. You\'ll be asked to sign in with Google to authorize the calendar event creation.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#073045' }}>
                  Meeting Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any instructions or materials students should prepare..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d636c] focus:border-transparent transition-all resize-none"
                  style={{ borderColor: '#e5e7eb' }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Invite Students */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: '#073045' }}>Select Students to Invite</h3>
                  <p className="text-sm text-gray-500">
                    {formData.selectedStudents.length} of {activeStudents.length} selected
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllStudents}
                  style={{ borderColor: '#1d636c', color: '#1d636c' }}
                >
                  {formData.selectedStudents.length === activeStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activeStudents.length > 0 ? (
                  activeStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`w-full flex items-center justify-between p-3 border-2 rounded-xl transition-all hover:shadow-sm ${
                        formData.selectedStudents.includes(student.id)
                          ? 'border-[#1d636c] bg-[#1d636c]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2" style={{ 
                          borderColor: formData.selectedStudents.includes(student.id) ? '#1d636c' : '#e5e7eb' 
                        }}>
                          <AvatarImage src={student.profilePhoto || ""} />
                          <AvatarFallback className="text-white text-sm" style={{ backgroundColor: '#1d636c' }}>
                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-gray-500">{student.studentClass || 'Student'}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        formData.selectedStudents.includes(student.id)
                          ? 'bg-[#1d636c] border-[#1d636c]'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedStudents.includes(student.id) && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No active students to invite</p>
                    <p className="text-sm text-gray-400">Students can still join via the meeting link</p>
                  </div>
                )}
              </div>

              {/* Meeting Summary */}
              <div className="p-4 rounded-xl border-2" style={{ borderColor: '#e6941f', backgroundColor: '#fffbf0' }}>
                <h4 className="font-semibold text-sm mb-3 flex items-center" style={{ color: '#073045' }}>
                  <FileText className="h-4 w-4 mr-2" />
                  Meeting Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium">{formData.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      {formData.meetingDate && formData.meetingTime 
                        ? `${format(new Date(formData.meetingDate), 'MMM d, yyyy')} at ${formData.meetingTime}`
                        : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{formData.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-medium" style={{ color: platformColors[formData.meetingPlatform] }}>
                      {platformLabels[formData.meetingPlatform]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students Invited:</span>
                    <span className="font-medium">{formData.selectedStudents.length}</span>
                  </div>
                  {formData.isRecurring && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recurring:</span>
                      <span className="font-medium capitalize">{formData.recurringPattern}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="border-2"
                style={{ borderColor: '#e5e7eb' }}
                disabled={isCreating}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                className="text-white"
                style={{ backgroundColor: '#1d636c' }}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="text-white min-w-[160px]"
                style={{ backgroundColor: '#1d636c' }}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {formData.meetingPlatform === 'zoom' ? 'Creating Zoom...' : 'Creating Meet...'}
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    {editMeeting ? 'Update Meeting' : 'Create Meeting'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function TutorDashboardPage() {
  const { user, userData, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [performance, setPerformance] = useState<any>(null);
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'students' | 'earnings' | 'schedule' | 'resources' | 'performance' | 'support' | 'meetings'>('overview');
  
  // Video meeting state
  const [meetings, setMeetings] = useState<VideoMeeting[]>([]);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<VideoMeeting | null>(null);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [meetingFilter, setMeetingFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  
  const [availability] = useState([
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

  useEffect(() => {
    if (user && userData) {
      loadTutorDashboardData();
    }
  }, [user, userData]);

  useEffect(() => {
    if (user && activeTab === 'meetings') {
      loadMeetings();
    }
  }, [user, activeTab]);

  const loadTutorDashboardData = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error("Error loading tutor dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VIDEO MEETING CRUD WITH PLATFORM API
  // ==========================================
  
  const loadMeetings = async () => {
    setMeetingsLoading(true);
    try {
      const meetingsRef = collection(db, 'meetings');
      const q = query(
        meetingsRef, 
        where('tutorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VideoMeeting[];
      setMeetings(meetingsData);
    } catch (error) {
      console.error("Error loading meetings:", error);
      toast.error("Failed to load meetings");
    } finally {
      setMeetingsLoading(false);
    }
  };

  const handleCreateMeeting = async (formData: MeetingFormData) => {
    setIsCreatingMeeting(true);
    try {
      let meetingLink = '';
      let zoomMeetingId: string | undefined;
      let googleCalendarEventId: string | undefined;

      if (editingMeeting) {
        // For edits, keep existing link or allow manual update
        meetingLink = formData.meetingLink || editingMeeting.meetingLink;
      } else {
        // Create via platform API
        if (formData.meetingPlatform === 'zoom') {
          toast.loading('Creating Zoom meeting...', { id: 'meeting-create' });
          const zoomResult = await createZoomMeeting(formData);
          if (zoomResult) {
            meetingLink = zoomResult.join_url;
            zoomMeetingId = zoomResult.id;
            toast.success('Zoom meeting created!', { id: 'meeting-create' });
          } else {
            // Fallback
            meetingLink = generateFallbackZoomLink();
            toast.success('Meeting created with placeholder Zoom link. Replace with your actual Zoom link.', { id: 'meeting-create' });
          }
        } else if (formData.meetingPlatform === 'google_meet') {
          toast.loading('Creating Google Meet...', { id: 'meeting-create' });
          const googleResult = await createGoogleMeetLink(formData);
          if (googleResult) {
            meetingLink = googleResult.meet_link;
            googleCalendarEventId = googleResult.event_id;
            toast.success('Google Meet created!', { id: 'meeting-create' });
          } else {
            // Fallback
            meetingLink = generateFallbackGoogleMeetLink();
            toast.success('Meeting created with placeholder Google Meet link. Sign in to Google to auto-generate.', { id: 'meeting-create' });
          }
        }
      }

      const studentNames = activeStudents
        .filter(s => formData.selectedStudents.includes(s.id))
        .map(s => `${s.firstName} ${s.lastName}`);

      const meetingData: any = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        meetingDate: formData.meetingDate,
        meetingTime: formData.meetingTime,
        duration: formData.duration,
        meetingLink,
        meetingPlatform: formData.meetingPlatform,
        students: formData.selectedStudents,
        studentNames,
        status: 'scheduled',
        maxParticipants: formData.maxParticipants,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.isRecurring ? formData.recurringPattern : null,
        notes: formData.notes,
        tutorId: user.uid,
        tutorName: `${userData?.firstName} ${userData?.lastName}`,
        updatedAt: serverTimestamp(),
      };

      if (zoomMeetingId) meetingData.zoomMeetingId = zoomMeetingId;
      if (googleCalendarEventId) meetingData.googleCalendarEventId = googleCalendarEventId;

      if (editingMeeting) {
        await updateDoc(doc(db, 'meetings', editingMeeting.id), meetingData);
        toast.success('Meeting updated successfully!');
      } else {
        meetingData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'meetings'), meetingData);
      }
      
      setEditingMeeting(null);
      setShowCreateMeeting(false);
      loadMeetings();
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error("Failed to save meeting");
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await deleteDoc(doc(db, 'meetings', meetingId));
      toast.success('Meeting deleted');
      loadMeetings();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      await updateDoc(doc(db, 'meetings', meetingId), { status: 'cancelled' });
      toast.success('Meeting cancelled');
      loadMeetings();
    } catch (error) {
      console.error("Error cancelling meeting:", error);
      toast.error("Failed to cancel meeting");
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const filteredMeetings = meetingFilter === 'all' 
    ? meetings 
    : meetings.filter(m => m.status === meetingFilter);

  // ==========================================
  // RENDER MEETINGS TAB
  // ==========================================

  const renderMeetings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>
            Video Meetings
          </h1>
          <p className="text-gray-600">Create Zoom or Google Meet sessions for your students</p>
        </div>
        <Button 
          onClick={() => { setEditingMeeting(null); setShowCreateMeeting(true); }}
          className="text-white hover:opacity-90 shadow-lg"
          style={{ backgroundColor: '#1d636c' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Meeting
        </Button>
      </div>

      {/* Platform Info Banner */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 rounded-xl border-2 flex items-center space-x-4" style={{ borderColor: '#2D8CFF', backgroundColor: '#f0f7ff' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2D8CFF' }}>
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold" style={{ color: '#073045' }}>Zoom Integration</p>
            <p className="text-xs text-gray-500">Connected via Server-to-Server OAuth</p>
          </div>
          <CheckCircle className="h-5 w-5 ml-auto flex-shrink-0" style={{ color: '#2D8CFF' }} />
        </div>
        <div className="p-4 rounded-xl border-2 flex items-center space-x-4" style={{ borderColor: '#00897B', backgroundColor: '#f0faf9' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00897B' }}>
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold" style={{ color: '#073045' }}>Google Meet Integration</p>
            <p className="text-xs text-gray-500">Connected via Google Calendar API</p>
          </div>
          <CheckCircle className="h-5 w-5 ml-auto flex-shrink-0" style={{ color: '#00897B' }} />
        </div>
      </div>

      {/* Meeting Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 hover:shadow-lg transition-all" style={{ borderColor: '#1d636c' }}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#1d636c' }}>
                <Video className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold" style={{ color: '#073045' }}>{meetings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all" style={{ borderColor: '#e6941f' }}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#e6941f' }}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Scheduled</p>
                <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                  {meetings.filter(m => m.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all" style={{ borderColor: '#073045' }}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-green-600">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                  {meetings.filter(m => m.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all" style={{ borderColor: '#e5e7eb' }}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-red-500">
                <X className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Cancelled</p>
                <p className="text-2xl font-bold" style={{ color: '#073045' }}>
                  {meetings.filter(m => m.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setMeetingFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              meetingFilter === filter
                ? 'text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={meetingFilter === filter ? { backgroundColor: '#1d636c' } : {}}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)} 
            {filter === 'all' ? ` (${meetings.length})` : ` (${meetings.filter(m => m.status === filter).length})`}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetingsLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: '#1d636c' }} />
            <p className="text-gray-500">Loading meetings...</p>
          </div>
        ) : filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="border-2 hover:shadow-lg transition-all group" style={{ borderColor: '#e5e7eb' }}>
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Meeting Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: platformColors[meeting.meetingPlatform] }}>
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-lg" style={{ color: '#073045' }}>
                          {meeting.title}
                        </h3>
                        <Badge className={`text-xs ${
                          meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          meeting.status === 'live' ? 'bg-green-100 text-green-800' :
                          meeting.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {meeting.status === 'live' && <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse inline-block" />}
                          {meeting.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {meeting.meetingDate ? format(new Date(meeting.meetingDate), 'MMM d, yyyy') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {meeting.meetingTime} ({meeting.duration} min)
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {meeting.students?.length || 0} invited
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                          {meeting.subject}
                        </Badge>
                        <Badge 
                          className="text-white text-xs"
                          style={{ backgroundColor: platformColors[meeting.meetingPlatform] }}
                        >
                          {platformLabels[meeting.meetingPlatform]}
                        </Badge>
                        {meeting.isRecurring && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            {meeting.recurringPattern}
                          </Badge>
                        )}
                        {meeting.zoomMeetingId && (
                          <Badge className="bg-blue-50 text-blue-700 text-xs">
                            ID: {meeting.zoomMeetingId}
                          </Badge>
                        )}
                      </div>

                      {meeting.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-1">{meeting.description}</p>
                      )}

                      {/* Meeting Link Preview */}
                      {meeting.meetingLink && (
                        <div className="mt-2 flex items-center gap-2">
                          <Link2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <p className="text-xs text-gray-400 truncate max-w-xs">{meeting.meetingLink}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    {meeting.status === 'scheduled' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => window.open(meeting.meetingLink, '_blank')}
                          className="text-white shadow-md"
                          style={{ backgroundColor: platformColors[meeting.meetingPlatform] }}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          {meeting.meetingPlatform === 'zoom' ? 'Start Zoom' : 'Start Meet'}
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Copy meeting link"
                            onClick={() => {
                              navigator.clipboard.writeText(meeting.meetingLink);
                              toast.success('Meeting link copied!');
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Edit meeting"
                            onClick={() => {
                              setEditingMeeting(meeting);
                              setShowCreateMeeting(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Cancel meeting"
                            onClick={() => handleCancelMeeting(meeting.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Delete meeting"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                    {(meeting.status === 'completed' || meeting.status === 'cancelled') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="text-red-500 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-2 border-dashed" style={{ borderColor: '#e5e7eb' }}>
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f0fafb' }}>
                <Video className="h-10 w-10" style={{ color: '#1d636c' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#073045' }}>
                {meetingFilter === 'all' ? 'No meetings yet' : `No ${meetingFilter} meetings`}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {meetingFilter === 'all' 
                  ? 'Create your first video meeting using Zoom or Google Meet.'
                  : `You don't have any ${meetingFilter} meetings.`}
              </p>
              {meetingFilter === 'all' && (
                <Button 
                  onClick={() => { setEditingMeeting(null); setShowCreateMeeting(true); }}
                  className="text-white"
                  style={{ backgroundColor: '#1d636c' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Meeting
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'bookings': return renderBookings();
      case 'students': return renderStudents();
      case 'earnings': return renderEarnings();
      case 'schedule': return renderSchedule();
      case 'resources': return renderResources();
      case 'performance': return renderPerformance();
      case 'support': return renderSupport();
      case 'meetings': return renderMeetings();
      default: return renderOverview();
    }
  };

  const renderOverview = () => (
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
                  `${activeStudents.filter((s: any) => s.upcomingSessions > 0).length} with upcoming sessions` : 
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
                  className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors"
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
                      <Badge className="text-xs border" style={{ borderColor: '#1d636c', color: '#1d636c' }}>
                        {booking.subject || "Subject"}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {booking.sessionDate ? format(new Date(booking.sessionDate), 'MMM d') : "Date"} • {booking.sessionTime || "Time"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={`text-xs ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
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
                  <p className="text-sm text-gray-600 mt-2">Update your profile to attract more students</p>
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
              {activeStudents.slice(0, 5).map((student: any) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors"
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
                        <Badge className="text-xs" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                          {student.upcomingSessions || 0} sessions
                        </Badge>
                        {student.studentClass && (
                          <span className="text-xs text-gray-600">{student.studentClass}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('students')}>
                    <Eye className="h-4 w-4" style={{ color: '#073045' }} />
                  </Button>
                </div>
              ))}
              {activeStudents.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4" style={{ color: '#1d636c' }} />
                  <p className="text-gray-600">No active students</p>
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
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className={`h-4 w-4 mx-0.5 ${star <= Math.floor(performance?.averageRating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
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
              <p className="text-sm text-gray-600">{stats?.pendingSessions || 0} pending sessions</p>
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
              <p className="text-sm text-gray-600">{stats?.subjects?.slice(0, 2).join(', ') || 'No subjects'}</p>
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
              className="h-auto py-6 border-2 hover:border-[#2D8CFF] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={() => { setEditingMeeting(null); setShowCreateMeeting(true); setActiveTab('meetings'); }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#2D8CFF' }}>
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Zoom Meeting</p>
                  <p className="text-xs text-gray-600">Create Zoom class</p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto py-6 border-2 hover:border-[#00897B] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{ borderColor: '#e5e7eb', color: '#073045' }}
              onClick={() => { setEditingMeeting(null); setShowCreateMeeting(true); setActiveTab('meetings'); }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#00897B' }}>
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Google Meet</p>
                  <p className="text-xs text-gray-600">Start Google class</p>
                </div>
              </div>
            </Button>

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
                  <p className="font-medium">Schedule</p>
                  <p className="text-xs text-gray-600">Add availability</p>
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
                  <p className="font-medium">Earnings</p>
                  <p className="text-xs text-gray-600">Check your income</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Bookings</h1>
          <p className="text-gray-600">Manage your tutoring sessions and appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />Filter
          </Button>
          <Button size="sm" style={{ backgroundColor: '#1d636c', color: 'white' }}>
            <Plus className="h-4 w-4 mr-2" />New Booking
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
                        <span className="text-sm">{booking.sessionDate ? format(new Date(booking.sessionDate), 'MMM d, yyyy') : 'Date not set'}</span>
                        <span className="text-sm">{booking.sessionTime}</span>
                        <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>₦{booking.amount?.toLocaleString()}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><Video className="h-4 w-4 mr-2" />Start</Button>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
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
                      <p className="text-xs text-gray-500">Completed on {booking.sessionDate ? format(new Date(booking.sessionDate), 'MMM d, yyyy') : 'N/A'}</p>
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

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Students</h1>
          <p className="text-gray-600">Manage your students and their progress</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search students..." className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64" />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeStudents.map((student: any) => (
              <Card key={student.id} className="border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-20 w-20 border-4" style={{ borderColor: '#1d636c' }}>
                      <AvatarImage src={student.profilePhoto || ""} />
                      <AvatarFallback className="text-xl">{student.firstName?.charAt(0)}{student.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{student.firstName} {student.lastName}</h3>
                      <p className="text-gray-600">{student.studentClass || 'Grade Level'}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>{student.upcomingSessions || 0} sessions</Badge>
                        <Badge variant="outline">{student.subject || 'Subject'}</Badge>
                      </div>
                    </div>
                    <div className="w-full space-y-2">
                      <Button variant="outline" className="w-full" style={{ borderColor: '#1d636c', color: '#1d636c' }}>
                        <MessageSquare className="h-4 w-4 mr-2" />Message
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={() => setActiveTab('schedule')}>
                        <Calendar className="h-4 w-4 mr-2" />Schedule Session
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

  const renderEarnings = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Earnings</h1>
          <p className="text-gray-600">Track your income and payments</p>
        </div>
        <Button size="sm" style={{ backgroundColor: '#1d636c', color: 'white' }}>
          <Download className="h-4 w-4 mr-2" />Download Report
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Earnings', value: `₦${stats?.totalEarnings?.toLocaleString() || '0'}`, icon: DollarSign, color: '#1d636c', badge: '+12%', badgeClass: 'bg-green-100 text-green-800' },
          { label: 'This Month', value: `₦${monthlyEarnings?.toLocaleString() || '0'}`, icon: CreditCard, color: '#e6941f', badge: 'Current', badgeClass: 'bg-blue-100 text-blue-800' },
          { label: 'Pending', value: `₦${(monthlyEarnings * 0.2).toLocaleString()}`, icon: Calendar, color: '#073045', badge: 'Pending', badgeClass: 'bg-yellow-100 text-yellow-800' },
          { label: 'Available', value: `₦${(monthlyEarnings * 0.8).toLocaleString()}`, icon: Download, color: '#1d636c', badge: 'Withdraw', badgeClass: 'bg-purple-100 text-purple-800' },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: item.color }}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <Badge className={item.badgeClass}>{item.badge}</Badge>
              </div>
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
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
                    <p className="text-sm text-gray-600">{booking.subject} • {booking.sessionDate ? format(new Date(booking.sessionDate), 'MMM d, yyyy') : 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₦{booking.amount?.toLocaleString()}</p>
                  <Badge className={booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{booking.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Schedule</h1>
          <p className="text-gray-600">Manage your availability and sessions</p>
        </div>
        <Button size="sm" style={{ backgroundColor: '#1d636c', color: 'white' }}>
          <Plus className="h-4 w-4 mr-2" />Add Availability
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Availability</CardTitle>
            <CardDescription>Your regular teaching hours</CardDescription>
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
                      <Avatar className="h-8 w-8"><AvatarFallback>{booking.studentName?.charAt(0)}</AvatarFallback></Avatar>
                      <span className="font-medium">{booking.studentName}</span>
                    </div>
                    <Badge>{booking.subject}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{booking.sessionDate ? format(new Date(booking.sessionDate), 'MMM d, yyyy') : 'Date'} • {booking.sessionTime}</span>
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

  const renderResources = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Teaching Resources</h1>
          <p className="text-gray-600">Access educational materials and tools</p>
        </div>
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
                  <Button variant="outline" className="w-full" style={{ borderColor: '#1d636c', color: '#1d636c' }}>
                    <Download className="h-4 w-4 mr-2" />Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Performance Analytics</h1>
          <p className="text-gray-600">Track your tutoring performance and growth</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export Report</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Student Retention', value: `${performanceMetrics.studentRetention}%`, icon: Users2, color: '#1d636c', badge: '+8%', badgeClass: 'bg-green-100 text-green-800' },
          { label: 'Session Growth', value: `${performanceMetrics.sessionGrowth}%`, icon: TrendingUp, color: '#e6941f', badge: '+42%', badgeClass: 'bg-blue-100 text-blue-800' },
          { label: 'Rating Trend', value: `${performanceMetrics.ratingTrend}`, icon: Star, color: '#073045', badge: '/5', badgeClass: 'bg-yellow-100 text-yellow-800' },
          { label: 'Engagement Score', value: `${performanceMetrics.engagementScore}%`, icon: PieChart, color: '#1d636c', badge: 'Excellent', badgeClass: 'bg-purple-100 text-purple-800' },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: item.color }}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <Badge className={item.badgeClass}>{item.badge}</Badge>
              </div>
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
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
        <p className="text-gray-600 text-lg">We're here to help you succeed as a tutor.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'Live Chat Support', desc: 'Chat with our support team in real-time.', icon: MessageSquare, color: '#e6941f', btnLabel: 'Start Chat', btnStyle: { backgroundColor: '#1d636c', color: 'white' } },
          { title: 'Email Support', desc: "Send us an email and we'll respond within 24 hours.", icon: Mail, color: '#073045', btnLabel: 'Email Us', btnStyle: { borderColor: '#e6941f', color: '#e6941f' } },
          { title: 'Help Center', desc: 'Browse our comprehensive knowledge base and FAQs.', icon: BookOpen, color: '#1d636c', btnLabel: 'Visit Help Center', btnStyle: { borderColor: '#073045', color: '#073045' } },
        ].map((item, i) => (
          <Card key={i} className="border-2 hover:border-[#1d636c] transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full" style={{ backgroundColor: item.color }}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                <Button variant="outline" className="w-full" style={item.btnStyle}>{item.btnLabel}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { q: 'How do I update my availability?', a: 'Go to the Schedule section and click "Add Availability" to set your teaching hours.' },
              { q: 'When do I get paid?', a: 'Payments are processed weekly on Fridays for all completed sessions.' },
              { q: 'How can I improve my rating?', a: 'Be punctual, prepared, and provide quality instruction. Request feedback after sessions.' },
            ].map((faq, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
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
          <p className="text-gray-600">Preparing your tutoring insights...</p>
        </div>
      </div>
    );
  }

  if (userData?.tutorStatus !== 'approved') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
            <div className="flex items-center space-x-2">
              <Image src="/edumentor-logo.png" alt="Edumentor Logo" width={32} height={32} className="h-8 w-8" />
              <span className="text-2xl font-bold" style={{ color: '#073045' }}>Edumentor</span>
            </div>
            <Link href="/"><Button variant="ghost" size="sm" style={{ color: '#073045' }}><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Button></Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-2xl border-2" style={{ borderColor: '#e5e7eb' }}>
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e6941f' }}>
                <Clock className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl" style={{ color: '#073045' }}>Application Under Review</CardTitle>
              <CardDescription className="text-lg">
                {userData?.tutorStatus === 'pending_payment' 
                  ? "Please complete your application by making the ₦5,000 payment."
                  : "Your tutor application is being reviewed by our team."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-3">
                <p className="text-gray-600">
                  {userData?.tutorStatus === 'pending_payment'
                    ? "Complete your application to start receiving students."
                    : "We'll notify you via email once approved. This usually takes 2-3 business days."}
                </p>
                <Badge className="mx-auto" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                  <Sparkles className="inline h-3 w-3 mr-1" />Estimated review time: 2-3 business days
                </Badge>
              </div>
              <div className="space-y-3">
                {userData?.tutorStatus === 'pending_payment' && (
                  <Link href="/become-tutor">
                    <Button className="w-full" style={{ backgroundColor: '#1d636c', color: 'white' }}>
                      Complete Application<ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link href="/">
                  <Button variant="outline" className="w-full border-2" style={{ borderColor: '#e6941f', color: '#e6941f' }}>Return to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={showCreateMeeting}
        onClose={() => { setShowCreateMeeting(false); setEditingMeeting(null); }}
        onSubmit={handleCreateMeeting}
        activeStudents={activeStudents}
        editMeeting={editingMeeting}
        isCreating={isCreatingMeeting}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <Image src="/edumentor-logo.png" alt="Edumentor Logo" width={32} height={32} className="h-8 w-8" />
              <span className="text-2xl font-bold" style={{ color: '#073045' }}>Edumentor</span>
              <Badge className="hidden md:inline-flex" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                <Sparkles className="inline h-3 w-3 mr-1" />Tutor Dashboard
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" style={{ color: '#073045' }} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="hidden md:flex items-center space-x-3">
              <Avatar className="h-9 w-9 border-2" style={{ borderColor: '#1d636c' }}>
                <AvatarImage src={user?.photoURL || ""} alt={userData?.firstName || "Tutor"} />
                <AvatarFallback className="text-white" style={{ backgroundColor: '#1d636c' }}>
                  {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold" style={{ color: '#073045' }}>{userData?.firstName} {userData?.lastName}</p>
                <p className="text-xs text-gray-600">Verified Tutor</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} style={{ color: '#073045' }}>
              <LogOut className="h-4 w-4 mr-2" />Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:flex lg:flex-col lg:inset-0`}>
          <div className="flex-1 p-6 overflow-y-auto">
            {/* User Profile */}
            <div className="flex items-center space-x-3 mb-8 p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
              <Avatar className="h-12 w-12 border-2" style={{ borderColor: '#1d636c' }}>
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="text-white" style={{ backgroundColor: '#1d636c' }}>
                  {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#073045' }}>{userData?.firstName} {userData?.lastName}</p>
                <Badge className="mt-1" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                  <CheckCircle className="inline h-3 w-3 mr-1" />Verified
                </Badge>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#1d636c' }}>Dashboard</h3>
                <nav className="space-y-1">
                  {[
                    { tab: 'overview', icon: TrendingUp, label: 'Overview' },
                    { tab: 'bookings', icon: Calendar, label: 'Bookings' },
                    { tab: 'meetings', icon: Video, label: 'Video Meetings', badge: meetings.filter(m => m.status === 'scheduled').length },
                    { tab: 'students', icon: Users, label: 'Students' },
                    { tab: 'earnings', icon: DollarSign, label: 'Earnings' },
                    { tab: 'schedule', icon: Clock, label: 'Schedule' },
                  ].map(({ tab, icon: Icon, label, badge }) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                        activeTab === tab ? 'bg-[#1d636c] text-white' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium flex-1">{label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className="text-xs bg-[#e6941f] text-[#073045] px-2 py-0.5 rounded-full font-bold">{badge}</span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#1d636c' }}>Resources</h3>
                <nav className="space-y-1">
                  {[
                    { tab: 'resources', icon: BookOpen, label: 'Teaching Resources' },
                    { tab: 'performance', icon: BarChart, label: 'Performance Analytics' },
                  ].map(({ tab, icon: Icon, label }) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                        activeTab === tab ? 'bg-[#1d636c] text-white' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#1d636c' }}>Support</h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('support')}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                      activeTab === 'support' ? 'bg-[#1d636c] text-white' : 'hover:bg-gray-50'
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
                <span className="text-sm font-medium" style={{ color: '#073045' }}>This Month</span>
                <Badge style={{ backgroundColor: '#e6941f', color: '#073045' }}>₦{monthlyEarnings?.toLocaleString() || '0'}</Badge>
              </div>
              <Progress value={75} className="h-2 mb-2" />
              <p className="text-xs text-gray-600">
                {bookings.length} bookings · {activeStudents.length} active students · {meetings.filter(m => m.status === 'scheduled').length} meetings
              </p>
            </div>
          </div>
          
          {sidebarOpen && (
            <div className="lg:hidden p-4 border-t">
              <Button onClick={() => setSidebarOpen(false)} className="w-full" variant="outline">Close Menu</Button>
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
    </div>
  );
}