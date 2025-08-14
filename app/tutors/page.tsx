import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Star, MapPin, Filter, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function TutorsPage() {
  const tutors = [
    {
      id: 1,
      name: "Adebayo Olumide",
      qualification: "B.Sc Computer Science",
      university: "University of Lagos",
      rating: 4.9,
      reviews: 45,
      location: "Lagos State",
      subjects: ["Mathematics", "Physics", "Computer Science"],
      packages: ["JAMB", "WAEC"],
      experience: "3 years",
      hourlyRate: "₦3,000",
      availability: "Available",
      bio: "Passionate about making complex mathematical concepts simple and understandable.",
      verified: true,
    },
    {
      id: 2,
      name: "Fatima Abubakar",
      qualification: "B.A English Language",
      university: "Ahmadu Bello University",
      rating: 4.8,
      reviews: 38,
      location: "Kaduna State",
      subjects: ["English Language", "Literature", "Government"],
      packages: ["JAMB", "WAEC", "Common Entrance"],
      experience: "2 years",
      hourlyRate: "₦2,500",
      availability: "Available",
      bio: "Dedicated to improving students' communication and analytical skills.",
      verified: true,
    },
    {
      id: 3,
      name: "Chinedu Okafor",
      qualification: "B.Sc Chemistry",
      university: "University of Nigeria, Nsukka",
      rating: 4.7,
      reviews: 52,
      location: "Enugu State",
      subjects: ["Chemistry", "Biology", "Mathematics"],
      packages: ["JAMB", "WAEC", "NECO"],
      experience: "4 years",
      hourlyRate: "₦3,500",
      availability: "Busy",
      bio: "Making science fun and accessible for all students.",
      verified: true,
    },
    {
      id: 4,
      name: "Blessing Okoro",
      qualification: "B.Sc Economics",
      university: "University of Ibadan",
      rating: 4.9,
      reviews: 41,
      location: "Oyo State",
      subjects: ["Economics", "Mathematics", "Government"],
      packages: ["JAMB", "WAEC"],
      experience: "2 years",
      hourlyRate: "₦2,800",
      availability: "Available",
      bio: "Helping students understand economic principles and their real-world applications.",
      verified: true,
    },
    {
      id: 5,
      name: "Ibrahim Musa",
      qualification: "B.Sc Physics",
      university: "Bayero University Kano",
      rating: 4.6,
      reviews: 29,
      location: "Kano State",
      subjects: ["Physics", "Mathematics", "Further Mathematics"],
      packages: ["JAMB", "WAEC"],
      experience: "1 year",
      hourlyRate: "₦2,200",
      availability: "Available",
      bio: "Making physics concepts clear and understandable for all levels.",
      verified: true,
    },
    {
      id: 6,
      name: "Grace Adeola",
      qualification: "B.Sc Biology",
      university: "Obafemi Awolowo University",
      rating: 4.8,
      reviews: 36,
      location: "Osun State",
      subjects: ["Biology", "Chemistry", "Agricultural Science"],
      packages: ["JAMB", "WAEC", "NECO"],
      experience: "3 years",
      hourlyRate: "₦3,200",
      availability: "Available",
      bio: "Passionate about life sciences and helping students excel in biology.",
      verified: true,
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
            <Link href="/packages" className="text-sm font-medium hover:text-primary transition-colors">
              Packages
            </Link>
            <Link href="/tutors" className="text-sm font-medium text-primary">
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
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Find Your Perfect Tutor</h1>
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
              Browse through our verified NYSC corps members and experienced tutors. Find the perfect match for your
              child's learning needs.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, subject, or location..." className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamb">JAMB</SelectItem>
                  <SelectItem value="waec">WAEC</SelectItem>
                  <SelectItem value="neco">NECO</SelectItem>
                  <SelectItem value="common-entrance">Common Entrance</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lagos">Lagos</SelectItem>
                  <SelectItem value="abuja">Abuja</SelectItem>
                  <SelectItem value="kano">Kano</SelectItem>
                  <SelectItem value="rivers">Rivers</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tutors Grid */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={`/placeholder.svg?height=60&width=60&query=Nigerian tutor ${tutor.name}`}
                        alt={tutor.name}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {tutor.name}
                          {tutor.verified && (
                            <Badge variant="secondary" className="text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">{tutor.qualification}</CardDescription>
                        <p className="text-xs text-muted-foreground">{tutor.university}</p>
                      </div>
                    </div>
                    <Badge variant={tutor.availability === "Available" ? "default" : "secondary"} className="text-xs">
                      {tutor.availability}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{tutor.rating}</span>
                      <span className="text-muted-foreground">({tutor.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs">{tutor.location}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Experience:</span>
                      <span>{tutor.experience}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-medium">{tutor.hourlyRate}/hour</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Packages:</p>
                    <div className="flex flex-wrap gap-1">
                      {tutor.packages.map((pkg, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {pkg}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/tutors/${tutor.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/book/${tutor.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Book Session
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Tutors
            </Button>
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
