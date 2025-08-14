"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Calendar, Clock, DollarSign, Star, Users, TrendingUp, Bell, Settings, LogOut } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // Mock user data - in real app this would come from authentication
  const user = {
    name: "Adebayo Olumide",
    email: "adebayo.olumide@email.com",
    type: "tutor", // or "student"
    avatar: "/placeholder.svg?height=40&width=40",
  }

  const tutorStats = {
    totalEarnings: "₦125,000",
    activeStudents: 12,
    completedSessions: 45,
    rating: 4.9,
    upcomingSessions: 3,
  }

  const recentSessions = [
    {
      id: 1,
      student: "Fatima Abubakar",
      subject: "Mathematics",
      package: "JAMB",
      date: "2024-01-15",
      time: "2:00 PM",
      status: "completed",
      earnings: "₦3,000",
    },
    {
      id: 2,
      student: "Chinedu Okafor",
      subject: "Physics",
      package: "WAEC",
      date: "2024-01-16",
      time: "4:00 PM",
      status: "upcoming",
      earnings: "₦3,500",
    },
    {
      id: 3,
      student: "Blessing Okoro",
      subject: "Chemistry",
      package: "JAMB",
      date: "2024-01-14",
      time: "10:00 AM",
      status: "completed",
      earnings: "₦3,000",
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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30 p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Dashboard</h3>
              <nav className="space-y-1">
                <Link href="/dashboard" className="flex items-center space-x-2 text-sm font-medium text-primary">
                  <TrendingUp className="h-4 w-4" />
                  <span>Overview</span>
                </Link>
                <Link
                  href="/dashboard/sessions"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Sessions</span>
                </Link>
                <Link
                  href="/dashboard/students"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Users className="h-4 w-4" />
                  <span>Students</span>
                </Link>
                <Link
                  href="/dashboard/earnings"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Earnings</span>
                </Link>
              </nav>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Account</h3>
              <nav className="space-y-1">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
                <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome back, {user.name.split(" ")[0]}!</h1>
              <p className="text-muted-foreground">Here's what's happening with your tutoring activities today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tutorStats.totalEarnings}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tutorStats.activeStudents}</div>
                  <p className="text-xs text-muted-foreground">+2 new this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tutorStats.completedSessions}</div>
                  <p className="text-xs text-muted-foreground">+5 this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tutorStats.rating}</div>
                  <p className="text-xs text-muted-foreground">Based on 45 reviews</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                  <CardDescription>Your latest tutoring sessions and upcoming bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{session.student}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.subject} • {session.package}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.date} at {session.time}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={session.status === "completed" ? "default" : "secondary"} className="text-xs">
                            {session.status}
                          </Badge>
                          <p className="text-sm font-medium">{session.earnings}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/sessions">
                      <Button variant="outline" className="w-full bg-transparent">
                        View All Sessions
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Your tutoring performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Student Satisfaction</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Session Completion Rate</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile Completeness</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Link href="/dashboard/schedule">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Session
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Settings className="mr-2 h-4 w-4" />
                      Update Profile
                    </Button>
                  </Link>
                  <Link href="/dashboard/earnings">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <DollarSign className="mr-2 h-4 w-4" />
                      View Earnings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
