import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, Star, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
     {/* Header */}
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-16 items-center justify-between">
    <div className="flex items-center space-x-2">
      <Image 
        src="/edumentor-logo.png" // Replace with your actual logo path
        alt="Edumentor Logo"
        width={32}
        height={32}
        className="h-8 w-8" // Adjust size as needed
      />
      <span className="text-2xl font-bold text-primary">Edumentor</span>
    </div>
    <nav className="hidden md:flex items-center space-x-6">
      <Link href="/packages" className="text-sm font-medium hover:text-primary transition-colors">
        Packages
      </Link>
      <Link href="/tutors" className="text-sm font-medium hover:text-primary transition-colors">
        Find Tutors
      </Link>
      <Link href="/become-tutor" className="text-sm font-medium hover:text-primary transition-colors">
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
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  🇳🇬 Made for Nigerian Students
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Find the Perfect <span className="text-primary">Tutor</span> for Your Child
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px]">
                  Connect with qualified NYSC corps members and experienced tutors. Specialized packages for JAMB, WAEC,
                  Common Entrance, and more.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/packages">
                  <Button size="lg" className="w-full sm:w-auto">
                    Browse Packages
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/become-tutor">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    Join as Tutor
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Active Tutors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2,000+</div>
                  <div className="text-sm text-muted-foreground">Students Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="Students learning with tutor"
                width={600}
                height={600}
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-sm text-muted-foreground">Student Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Packages Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Specialized Learning Packages</h2>
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
              Comprehensive tutoring packages designed for Nigerian educational system
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">JAMB Package</CardTitle>
                <CardDescription>Comprehensive UTME preparation with experienced tutors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    All 4 JAMB subjects
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Past questions & practice
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Mock exams
                  </div>
                  <div className="pt-4">
                    <div className="text-2xl font-bold">₦25,000</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-xl">WAEC Package</CardTitle>
                <CardDescription>Senior Secondary Certificate Exam preparation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />9 core subjects
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Practical sessions
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Continuous assessment
                  </div>
                  <div className="pt-4">
                    <div className="text-2xl font-bold">₦30,000</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-xl">Common Entrance</CardTitle>
                <CardDescription>Federal Unity Schools entrance exam preparation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />4 core subjects
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Age-appropriate teaching
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Fun learning methods
                  </div>
                  <div className="pt-4">
                    <div className="text-2xl font-bold">₦15,000</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-xl">Junior Secondary</CardTitle>
                <CardDescription>JSS 1-3 comprehensive subject tutoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    All JSS subjects
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Homework assistance
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Progress tracking
                  </div>
                  <div className="pt-4">
                    <div className="text-2xl font-bold">₦20,000</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Link href="/packages">
              <Button size="lg">
                View All Packages
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How Edumentor Works</h2>
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
              Simple steps to connect with the perfect tutor for your child
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Choose Package</h3>
              <p className="text-muted-foreground">
                Select the exam package that matches your child's needs and academic level
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold">Find Tutor</h3>
              <p className="text-muted-foreground">
                Browse qualified tutors, read reviews, and select the best match for your child
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold">Start Learning</h3>
              <p className="text-muted-foreground">
                Begin personalized tutoring sessions and track your child's progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Corps Members */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Calling All NYSC Corps Members!</h2>
              <p className="text-xl opacity-90 max-w-[800px] mx-auto">
                Turn your knowledge into income. Join our platform as a tutor and help Nigerian students excel while
                earning extra income during your service year.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/become-tutor">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Register as Tutor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tutor-benefits">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
            </div>
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
