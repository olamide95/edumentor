import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Users, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function PackagesPage() {
  const packages = [
    {
      id: "jamb",
      name: "JAMB UTME Package",
      description: "Comprehensive preparation for Joint Admissions and Matriculation Board exam",
      price: "₦25,000",
      duration: "4 months",
      subjects: [
        "English Language",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Literature",
        "Government",
        "Economics",
      ],
      features: [
        "4 core subjects + electives",
        "Weekly mock exams",
        "Past questions (10 years)",
        "CBT practice sessions",
        "Progress tracking",
        "24/7 support",
      ],
      popular: true,
      color: "bg-blue-500",
    },
    {
      id: "waec",
      name: "WAEC Package",
      description: "West African Examinations Council preparation for SSCE",
      price: "₦30,000",
      duration: "6 months",
      subjects: [
        "English Language",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Geography",
        "Economics",
        "Government",
        "Literature",
      ],
      features: [
        "9 core subjects",
        "Practical sessions",
        "Continuous assessment",
        "Past questions",
        "Lab experiments",
        "Oral English practice",
      ],
      popular: false,
      color: "bg-green-500",
    },
    {
      id: "common-entrance",
      name: "Common Entrance Package",
      description: "Federal Unity Schools entrance examination preparation",
      price: "₦15,000",
      duration: "3 months",
      subjects: ["English Language", "Mathematics", "Basic Science", "Social Studies"],
      features: [
        "4 core subjects",
        "Age-appropriate teaching",
        "Interactive learning",
        "Practice tests",
        "Fun activities",
        "Parent progress reports",
      ],
      popular: false,
      color: "bg-purple-500",
    },
    {
      id: "junior-secondary",
      name: "Junior Secondary Package",
      description: "Comprehensive tutoring for JSS 1-3 students",
      price: "₦20,000",
      duration: "Monthly",
      subjects: [
        "English Language",
        "Mathematics",
        "Basic Science",
        "Social Studies",
        "French",
        "Computer Studies",
        "Creative Arts",
      ],
      features: [
        "All JSS subjects",
        "Homework assistance",
        "Project guidance",
        "Exam preparation",
        "Study skills training",
        "Regular assessments",
      ],
      popular: false,
      color: "bg-orange-500",
    },
    {
      id: "primary-school",
      name: "Primary School Package",
      description: "Foundation learning for Primary 1-6 students",
      price: "₦12,000",
      duration: "Monthly",
      subjects: [
        "English Language",
        "Mathematics",
        "Basic Science",
        "Social Studies",
        "Verbal Reasoning",
        "Quantitative Reasoning",
      ],
      features: [
        "Core primary subjects",
        "Reading improvement",
        "Number work",
        "Creative writing",
        "Science experiments",
        "Fun learning games",
      ],
      popular: false,
      color: "bg-pink-500",
    },
    {
      id: "neco",
      name: "NECO Package",
      description: "National Examinations Council preparation",
      price: "₦28,000",
      duration: "5 months",
      subjects: [
        "English Language",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Geography",
        "Economics",
        "Government",
      ],
      features: [
        "8 core subjects",
        "Practical sessions",
        "Past questions",
        "Mock examinations",
        "Continuous assessment",
        "Result prediction",
      ],
      popular: false,
      color: "bg-indigo-500",
    },
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
            <Link href="/packages" className="text-sm font-medium text-primary">
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
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Choose Your Learning Package</h1>
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
              Specialized tutoring packages designed for Nigerian educational system. From primary school to university
              entrance exams.
            </p>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 ${pkg.popular ? "ring-2 ring-primary" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 ${pkg.color}/10 rounded-lg flex items-center justify-center mb-4`}>
                    <BookOpen className={`h-6 w-6 ${pkg.color.replace("bg-", "text-")}`} />
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-sm">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold">{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">/{pkg.duration}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                      Duration: {pkg.duration}
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-muted-foreground mr-2" />
                      {pkg.subjects.length} Subjects
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Key Features:</h4>
                    <div className="space-y-1">
                      {pkg.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                      {pkg.features.length > 4 && (
                        <div className="text-xs text-muted-foreground">+{pkg.features.length - 4} more features</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Subjects:</h4>
                    <div className="flex flex-wrap gap-1">
                      {pkg.subjects.slice(0, 4).map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {pkg.subjects.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{pkg.subjects.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Link href={`/packages/${pkg.id}`}>
                      <Button className="w-full" variant={pkg.popular ? "default" : "outline"}>
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/book/${pkg.id}`}>
                      <Button className="w-full" variant="secondary">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Package CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Need a Custom Package?</h2>
              <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
                Can't find exactly what you're looking for? We can create a personalized learning package tailored to
                your child's specific needs.
              </p>
            </div>
            <Link href="/custom-package">
              <Button size="lg">Request Custom Package</Button>
            </Link>
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
