'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, User, GraduationCap, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function RegisterPage() {
  const [userType, setUserType] = useState<"student" | "tutor" | "">("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    relationship: "",
    studentAge: "",
    studentClass: ""
  })

  const { registerStudent } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill all required fields")
      return
    }

    setLoading(true)

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: "student",
        ...(formData.relationship && { relationship: formData.relationship }),
        ...(formData.studentAge && { studentAge: formData.studentAge }),
        ...(formData.studentClass && { studentClass: formData.studentClass })
      }

      const result = await registerStudent(formData.email, formData.password, userData)
      
      if (result.success) {
        toast.success("Account created successfully!")
        router.push("/dashboard")
      } else {
        toast.error(result.error || "Registration failed")
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

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
            <Link href="/login">
              <Button size="sm" className="text-white hover:opacity-90" style={{ backgroundColor: '#1d636c' }}>
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-5xl">
          {!userType ? (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-block px-4 py-2 rounded-full" style={{ backgroundColor: '#e6941f', color: 'white' }}>
                  <span className="font-semibold">Join Edumentor</span>
                </div>
                <h1 className="text-4xl font-bold" style={{ color: '#073045' }}>Create Your Account</h1>
                <p className="text-xl text-gray-600">Choose how you'd like to join our learning community</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                <Card
                  className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:-translate-y-2"
                  style={{ borderColor: '#1d636c' }}
                  onClick={() => setUserType("student")}
                >
                  <CardHeader className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#1d636c' }}>
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl" style={{ color: '#073045' }}>Student/Parent</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Find qualified mentors to help your child excel academically. Access personalized learning and track progress.
                    </CardDescription>
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4" style={{ color: '#1d636c' }} />
                        <span>Browse verified mentors</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4" style={{ color: '#1d636c' }} />
                        <span>Track learning progress</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4" style={{ color: '#1d636c' }} />
                        <span>Schedule flexible sessions</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-dashed hover:-translate-y-2"
                  style={{ borderColor: '#e6941f' }}
                  onClick={() => {
                    toast("Tutors should register through 'Become a Tutor' page");
                    router.push("/become-tutor");
                  }}
                >
                  <CardHeader className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#e6941f' }}>
                      <GraduationCap className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl" style={{ color: '#073045' }}>Become a Mentor</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Share your knowledge and earn income. Join as an NYSC corps member or experienced educator.
                    </CardDescription>
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4" style={{ color: '#e6941f' }} />
                        <span>Flexible schedule</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4" style={{ color: '#e6941f' }} />
                        <span>Competitive pay</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4" style={{ color: '#e6941f' }} />
                        <span>Make an impact</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold hover:underline" style={{ color: '#1d636c' }}>
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          ) : userType === "student" ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center space-y-3 mb-8">
                <h1 className="text-3xl font-bold" style={{ color: '#073045' }}>Student/Parent Registration</h1>
                <p className="text-gray-600">Create your account to start connecting with Mentors</p>
              </div>

              <Card className="shadow-2xl border-0">
                <CardHeader style={{ borderBottom: '2px solid #f3f4f6' }}>
                  <CardTitle className="text-2xl" style={{ color: '#073045' }}>Your Information</CardTitle>
                  <CardDescription className="text-base">
                    Fill in your details to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-semibold" style={{ color: '#073045' }}>
                          First Name *
                        </Label>
                        <Input 
                          id="firstName" 
                          placeholder="Enter your first name" 
                          required 
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          disabled={loading}
                          className="h-11 border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold" style={{ color: '#073045' }}>
                          Last Name *
                        </Label>
                        <Input 
                          id="lastName" 
                          placeholder="Enter your last name" 
                          required 
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          disabled={loading}
                          className="h-11 border-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold" style={{ color: '#073045' }}>
                        Email Address *
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your.email@example.com" 
                        required 
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={loading}
                        className="h-11 border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold" style={{ color: '#073045' }}>
                        Phone Number *
                      </Label>
                      <Input 
                        id="phone" 
                        placeholder="+234 xxx xxx xxxx" 
                        required 
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={loading}
                        className="h-11 border-2"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="relationship" className="text-sm font-semibold" style={{ color: '#073045' }}>
                          Relationship to Student
                        </Label>
                        <Select 
                          value={formData.relationship}
                          onValueChange={(value) => handleInputChange("relationship", value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="h-11 border-2">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                            <SelectItem value="self">I am the student</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentAge" className="text-sm font-semibold" style={{ color: '#073045' }}>
                          Student's Age
                        </Label>
                        <Select 
                          value={formData.studentAge}
                          onValueChange={(value) => handleInputChange("studentAge", value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="h-11 border-2">
                            <SelectValue placeholder="Select age" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6-10">6-10 years (Primary)</SelectItem>
                            <SelectItem value="11-14">11-14 years (Junior Secondary)</SelectItem>
                            <SelectItem value="15-18">15-18 years (Senior Secondary)</SelectItem>
                            <SelectItem value="18+">18+ years (Post Secondary)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentClass" className="text-sm font-semibold" style={{ color: '#073045' }}>
                        Student's Class/Grade
                      </Label>
                      <Select 
                        value={formData.studentClass}
                        onValueChange={(value) => handleInputChange("studentClass", value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="h-11 border-2">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary-1">Primary 1</SelectItem>
                          <SelectItem value="primary-2">Primary 2</SelectItem>
                          <SelectItem value="primary-3">Primary 3</SelectItem>
                          <SelectItem value="primary-4">Primary 4</SelectItem>
                          <SelectItem value="primary-5">Primary 5</SelectItem>
                          <SelectItem value="primary-6">Primary 6</SelectItem>
                          <SelectItem value="jss-1">JSS 1</SelectItem>
                          <SelectItem value="jss-2">JSS 2</SelectItem>
                          <SelectItem value="jss-3">JSS 3</SelectItem>
                          <SelectItem value="sss-1">SSS 1</SelectItem>
                          <SelectItem value="sss-2">SSS 2</SelectItem>
                          <SelectItem value="sss-3">SSS 3</SelectItem>
                          <SelectItem value="university">University</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#073045' }}>
                        Password *
                      </Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Create a strong password" 
                        required 
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        disabled={loading}
                        className="h-11 border-2"
                      />
                      <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold" style={{ color: '#073045' }}>
                        Confirm Password *
                      </Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="Confirm your password" 
                        required 
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        disabled={loading}
                        className="h-11 border-2"
                      />
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                      <Checkbox 
                        id="terms" 
                        required 
                        disabled={loading}
                        className="mt-1"
                        style={{ borderColor: '#1d636c' }}
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <Link href="/terms" className="font-semibold hover:underline" style={{ color: '#1d636c' }}>
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="font-semibold hover:underline" style={{ color: '#1d636c' }}>
                          Privacy Policy
                        </Link>
                      </Label>
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
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold hover:underline" style={{ color: '#1d636c' }}>
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setUserType("")} 
                      className="w-full border-2"
                      disabled={loading}
                      style={{ borderColor: '#e5e7eb', color: '#073045' }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Account Type Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
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