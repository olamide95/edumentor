'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        if (result.userData?.role === 'student') {
          router.push("/dashboard");
        } else if (result.userData?.role === 'tutor' || result.userData?.role === 'tutor_applicant') {
          if (result.userData?.tutorStatus === 'approved') {
            router.push("/tutor-dashboard");
          } else if (result.userData?.tutorStatus === 'pending_review') {
            router.push("/tutor-dashboard?status=pending");
          } else if (result.userData?.tutorStatus === 'pending_payment') {
            router.push("/become-tutor");
          } else {
            router.push("/tutor-dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/edumentor-logo.png"
              alt="Edumentor Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold" style={{ color: '#073045' }}>Edumentor</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:opacity-80" style={{ color: '#073045' }}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-white hover:opacity-90" style={{ backgroundColor: '#1d636c' }}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8 p-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 rounded-full" style={{ backgroundColor: '#e6941f', color: 'white' }}>
                <span className="font-semibold">Welcome Back!</span>
              </div>
              <h1 className="text-5xl font-bold leading-tight" style={{ color: '#073045' }}>
                Continue Your Learning Journey
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Sign in to access your personalized dashboard, connect with tutors, and track your progress.
              </p>
            </div>

            <div className="space-y-6 pt-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1d636c' }}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: '#073045' }}>Access Your Lessons</h3>
                  <p className="text-gray-600">View scheduled sessions and learning materials</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e6941f' }}>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: '#073045' }}>Track Progress</h3>
                  <p className="text-gray-600">Monitor your academic improvement and achievements</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#073045' }}>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: '#073045' }}>Connect with Tutors</h3>
                  <p className="text-gray-600">Message your mentors and schedule new sessions</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Students learning"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0">
              <CardHeader className="space-y-1 pb-6" style={{ borderBottom: '2px solid #f3f4f6' }}>
                <CardTitle className="text-3xl font-bold text-center" style={{ color: '#073045' }}>
                  Sign In
                </CardTitle>
                <CardDescription className="text-center text-base">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold" style={{ color: '#073045' }}>
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="h-12 border-2 focus:border-opacity-50"
                      style={{ borderColor: '#e5e7eb' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#073045' }}>
                      Password
                    </Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter your password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="h-12 border-2"
                      style={{ borderColor: '#e5e7eb' }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        disabled={loading}
                        style={{ borderColor: '#1d636c' }}
                      />
                      <Label htmlFor="remember" className="text-sm font-medium cursor-pointer" style={{ color: '#073045' }}>
                        Remember me
                      </Label>
                    </div>
                    <Link href="/forgot-password" className="text-sm font-medium hover:underline" style={{ color: '#1d636c' }}>
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    className="w-full h-12 text-base font-semibold text-white hover:opacity-90 transition-opacity" 
                    disabled={loading}
                    style={{ backgroundColor: '#1d636c' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                      <p className="text-sm text-gray-600 mb-2">
                        Don't have an account?
                      </p>
                      <Link href="/register">
                        <Button 
                          variant="outline" 
                          className="w-full font-semibold hover:opacity-80 border-2"
                          style={{ borderColor: '#1d636c', color: '#1d636c' }}
                          type="button"
                        >
                          Sign up as Student/Parent
                        </Button>
                      </Link>
                    </div>

                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#fff7ed' }}>
                      <p className="text-sm text-gray-600 mb-2">
                        Want to become a mentor?
                      </p>
                      <Link href="/become-tutor">
                        <Button 
                          variant="outline" 
                          className="w-full font-semibold hover:opacity-80 border-2"
                          style={{ borderColor: '#e6941f', color: '#e6941f' }}
                          type="button"
                        >
                          Apply as Mentor
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Stats */}
            <div className="lg:hidden mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1d636c' }}>500+</div>
                <div className="text-sm text-gray-600">Mentors</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#e6941f' }}>2,000+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#073045' }}>95%</div>
                <div className="text-sm text-gray-600">Success</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            &copy; 2024 Edumentor. All rights reserved. Made with ❤️ for Nigerian students.
          </p>
        </div>
      </footer>
    </div>
  )
}