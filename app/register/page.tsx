"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, User, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [userType, setUserType] = useState("")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Edumentor</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-muted-foreground">Join TutorNG to start your learning journey</p>
          </div>

          {!userType ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Choose Account Type</h2>
              <div className="grid gap-4">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                  onClick={() => setUserType("student")}
                >
                  <CardHeader className="text-center">
                    <User className="h-12 w-12 mx-auto text-primary mb-2" />
                    <CardTitle>Student/Parent</CardTitle>
                    <CardDescription>Find qualified tutors for your child's education</CardDescription>
                  </CardHeader>
                </Card>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                  onClick={() => setUserType("tutor")}
                >
                  <CardHeader className="text-center">
                    <GraduationCap className="h-12 w-12 mx-auto text-primary mb-2" />
                    <CardTitle>Tutor</CardTitle>
                    <CardDescription>Share your knowledge and earn income teaching students</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{userType === "student" ? "Student/Parent Registration" : "Tutor Registration"}</CardTitle>
                <CardDescription>
                  {userType === "student"
                    ? "Create an account to find and book tutors"
                    : "Create an account to start teaching students"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter your first name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter your last name" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+234 xxx xxx xxxx" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Create a strong password" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm your password" required />
                  </div>

                  {userType === "student" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship to Student</Label>
                        <Select>
                          <SelectTrigger>
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
                        <Label htmlFor="studentAge">Student's Age Range</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6-10">6-10 years (Primary)</SelectItem>
                            <SelectItem value="11-14">11-14 years (Junior Secondary)</SelectItem>
                            <SelectItem value="15-18">15-18 years (Senior Secondary)</SelectItem>
                            <SelectItem value="18+">18+ years (Post Secondary)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {userType === "tutor" && (
                    <div className="space-y-2">
                      <Label htmlFor="qualification">Highest Qualification</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select qualification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bsc">Bachelor's Degree</SelectItem>
                          <SelectItem value="msc">Master's Degree</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="hnd">HND</SelectItem>
                          <SelectItem value="ond">OND</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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

                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link href="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>

                  {userType === "tutor" && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Note: Tutor accounts require document verification before activation
                      </p>
                    </div>
                  )}
                </form>

                <div className="mt-4">
                  <Button variant="outline" onClick={() => setUserType("")} className="w-full">
                    Back to Account Type Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
