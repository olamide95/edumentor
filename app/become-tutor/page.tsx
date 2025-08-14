"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Upload, CheckCircle, DollarSign, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function BecomeTutorPage() {
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
    },
    nysc: {
      deploymentNumber: "",
      stateOfDeployment: "",
      ppa: "",
      batchYear: "",
      callUpNumber: "",
    },
    education: {
      university: "",
      degree: "",
      graduationYear: "",
      cgpa: "",
      discipline: "",
    },
    teaching: {
      subjects: [],
      packages: [],
      experience: "",
      preferredMode: "",
      availability: [],
    },
    documents: {
      profilePhoto: null,
      nyscId: null,
      certificate: null,
      cv: null,
    },
  })

  const subjects = [
    "Mathematics",
    "English Language",
    "Physics",
    "Chemistry",
    "Biology",
    "Geography",
    "Economics",
    "Government",
    "Literature",
    "History",
    "Computer Science",
    "Further Mathematics",
    "Agricultural Science",
    "French",
    "Yoruba",
    "Hausa",
    "Igbo",
  ]

  const packages = ["JAMB UTME", "WAEC", "NECO", "Common Entrance", "Junior Secondary", "Primary School", "A-Levels"]

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Edumentor</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/packages" className="text-sm font-medium hover:text-primary transition-colors">
              Packages
            </Link>
            <Link href="/tutors" className="text-sm font-medium hover:text-primary transition-colors">
              Find Tutors
            </Link>
            <Link href="/become-tutor" className="text-sm font-medium text-primary">
              Become a Tutor
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Join Edumentor as a Tutor</h1>
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
              Turn your knowledge into income. Help Nigerian students excel while earning during your NYSC service year.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Why Teach with Edumentor?</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Earn Extra Income</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn ₦15,000 - ₦50,000 monthly teaching subjects you're passionate about
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Flexible Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Set your own hours and teach around your NYSC duties and personal schedule
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Make Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Help Nigerian students achieve their academic goals and build their future
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Tutor Registration Form</h2>
              <p className="text-muted-foreground">Complete all sections to join our platform as a qualified tutor</p>
            </div>

            <form className="space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Basic personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="Enter your first name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Enter your last name" required />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="your.email@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" placeholder="+234 xxx xxx xxxx" required />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input id="dateOfBirth" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stateOfOrigin">State of Origin *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {nigerianStates.map((state) => (
                            <SelectItem key={state} value={state.toLowerCase()}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NYSC Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    NYSC Information
                  </CardTitle>
                  <CardDescription>Your National Youth Service Corps details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deploymentNumber">Deployment Number *</Label>
                      <Input id="deploymentNumber" placeholder="e.g., NY/24A/xxxx" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="callUpNumber">Call-Up Number *</Label>
                      <Input id="callUpNumber" placeholder="Your NYSC call-up number" required />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="stateOfDeployment">State of Deployment *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deployment state" />
                        </SelectTrigger>
                        <SelectContent>
                          {nigerianStates.map((state) => (
                            <SelectItem key={state} value={state.toLowerCase()}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batchYear">Batch Year *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ppa">Place of Primary Assignment (PPA) *</Label>
                    <Input id="ppa" placeholder="Your current PPA" required />
                  </div>
                </CardContent>
              </Card>

              {/* Educational Background */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Educational Background
                  </CardTitle>
                  <CardDescription>Your university education and qualifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="university">University *</Label>
                      <Input id="university" placeholder="Your university name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree *</Label>
                      <Input id="degree" placeholder="e.g., B.Sc, B.A, B.Tech" required />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="discipline">Field of Study *</Label>
                      <Input id="discipline" placeholder="e.g., Computer Science" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year *</Label>
                      <Input id="graduationYear" placeholder="e.g., 2023" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cgpa">CGPA *</Label>
                      <Input id="cgpa" placeholder="e.g., 4.50" required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Teaching Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Teaching Preferences
                  </CardTitle>
                  <CardDescription>Subjects and packages you can teach</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Subjects You Can Teach *</Label>
                    <div className="grid gap-2 md:grid-cols-3">
                      {subjects.map((subject) => (
                        <div key={subject} className="flex items-center space-x-2">
                          <Checkbox id={subject} />
                          <Label htmlFor={subject} className="text-sm font-normal">
                            {subject}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Exam Packages *</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      {packages.map((pkg) => (
                        <div key={pkg} className="flex items-center space-x-2">
                          <Checkbox id={pkg} />
                          <Label htmlFor={pkg} className="text-sm font-normal">
                            {pkg}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="preferredMode">Preferred Teaching Mode *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select teaching mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online Only</SelectItem>
                          <SelectItem value="physical">Physical Only</SelectItem>
                          <SelectItem value="both">Both Online & Physical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Teaching Experience</Label>
                      <Select>
                        <SelectTrigger>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Brief Bio/Teaching Philosophy</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself and your teaching approach..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Document Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Document Upload
                  </CardTitle>
                  <CardDescription>Upload required documents for verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profilePhoto">Profile Photo *</Label>
                      <Input id="profilePhoto" type="file" accept="image/*" required />
                      <p className="text-xs text-muted-foreground">Clear passport photograph (max 2MB)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nyscId">NYSC ID Card *</Label>
                      <Input id="nyscId" type="file" accept="image/*,application/pdf" required />
                      <p className="text-xs text-muted-foreground">Front and back of NYSC ID (max 5MB)</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="certificate">University Certificate *</Label>
                      <Input id="certificate" type="file" accept="image/*,application/pdf" required />
                      <p className="text-xs text-muted-foreground">
                        Degree certificate or statement of result (max 5MB)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cv">Curriculum Vitae</Label>
                      <Input id="cv" type="file" accept="application/pdf" />
                      <p className="text-xs text-muted-foreground">Optional: Your CV in PDF format (max 3MB)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Submit */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verification" required />
                      <Label htmlFor="verification" className="text-sm">
                        I confirm that all information provided is accurate and I consent to verification of my
                        documents
                      </Label>
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      Submit Application
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Your application will be reviewed within 2-3 business days. You'll receive an email notification
                      once approved.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container px-4 md:px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Edumentor</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting Nigerian students with qualified tutors for academic excellence.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">For Students</h4>
              <div className="space-y-2 text-sm">
                <Link href="/packages" className="block hover:text-primary">
                  Exam Packages
                </Link>
                <Link href="/tutors" className="block hover:text-primary">
                  Find Tutors
                </Link>
                <Link href="/subjects" className="block hover:text-primary">
                  Subjects
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">For Tutors</h4>
              <div className="space-y-2 text-sm">
                <Link href="/become-tutor" className="block hover:text-primary">
                  Join as Tutor
                </Link>
                <Link href="/tutor-benefits" className="block hover:text-primary">
                  Benefits
                </Link>
                <Link href="/tutor-resources" className="block hover:text-primary">
                  Resources
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-sm">
                <Link href="/help" className="block hover:text-primary">
                  Help Center
                </Link>
                <Link href="/contact" className="block hover:text-primary">
                  Contact Us
                </Link>
                <Link href="/privacy" className="block hover:text-primary">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Edumentor. All rights reserved. Made with ❤️ for Nigerian students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
