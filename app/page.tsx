'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, Star, ArrowRight, CheckCircle, TrendingUp, Target, Heart, Sparkles, Mail, Phone, MapPin } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link";

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState('login');

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAuthClick = (type) => {
    setAuthType(type);
    setShowAuthModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e6941f' }}>
 <Image 
    src="/edumentor-logo.png"
    alt="Edumentor Logo"
    width={32}
    height={32}
    className="h-8 w-8"
  />            </div>
            <span className="text-2xl font-bold" style={{ color: '#073045' }}>Edumentor</span>
          </div>
            <nav className="hidden md:flex items-center space-x-6">
            <Link href="/tutors" className="text-sm font-medium hover:opacity-80 transition-colors" style={{ color: '#073045' }}>
              Find Mentors
            </Link>
            <Link href="/become-tutor" className="text-sm font-medium hover:opacity-80 transition-colors" style={{ color: '#073045' }}>
              Become a Mentor
            </Link>
            <button onClick={() => scrollToSection('about')} className="text-sm font-medium hover:opacity-80 transition-colors" style={{ color: '#073045' }}>
              About
            </button>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hover:opacity-80" style={{ color: '#073045' }}>
                Login
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

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#073045' }}>
              {authType === 'login' ? 'Welcome Back!' : 'Get Started'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#073045' }}>Email</label>
                <input type="email" className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-opacity-80" style={{ borderColor: '#1d636c' }} placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#073045' }}>Password</label>
                <input type="password" className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-opacity-80" style={{ borderColor: '#1d636c' }} placeholder="••••••••" />
              </div>
              {authType === 'register' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#073045' }}>I am a:</label>
                  <select className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-opacity-80" style={{ borderColor: '#1d636c' }}>
                    <option>Parent/Guardian</option>
                    <option>Student</option>
                    <option>Mentor/Tutor</option>
                  </select>
                </div>
              )}
              <Button className="w-full text-white hover:opacity-90" style={{ backgroundColor: '#1d636c' }}>
                {authType === 'login' ? 'Login' : 'Create Account'}
              </Button>
              <p className="text-center text-sm text-gray-600">
                {authType === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setAuthType(authType === 'login' ? 'register' : 'login')} className="font-semibold" style={{ color: '#1d636c' }}>
                  {authType === 'login' ? 'Sign up' : 'Login'}
                </button>
              </p>
            </div>
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #073045 0%, #1d636c 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit mx-auto lg:mx-0 px-4 py-2 text-sm font-semibold" style={{ backgroundColor: '#e6941f', color: '#073045' }}>
                  🇳🇬 Empowering Nigerian youths
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
                  Unlock Your Child's <span style={{ color: '#e6941f' }}>Academic Potential</span>
                </h1>
                <p className="text-xl text-white/90 max-w-[600px] mx-auto lg:mx-0 leading-relaxed">
                  Connect with passionate, qualified mentors who understand the Nigerian educational system. 
                  From JAMB to WAEC, we're here to guide every step of your child's learning journey.
                </p>
              </div>

<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
  <Link href="/tutors" passHref>
    <Button 
      size="lg" 
      className="w-full sm:w-auto text-lg px-8 hover:opacity-90" 
      style={{ backgroundColor: '#e6941f', color: '#073045' }}
    >
      Start Learning Today
      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  </Link>
  
  <Link href="/tutors" passHref>
    <Button 
      variant="outline" 
      size="lg" 
      className="w-full sm:w-auto text-lg px-8 border-2 border-white text-white hover:bg-white/10"
    >
      Browse Mentors
    </Button>
  </Link>
</div>
              <div className="flex items-center justify-center lg:justify-start space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-sm text-white/80">Expert Mentors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">2,000+</div>
                  <div className="text-sm text-white/80">Happy Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: '#e6941f' }}>95%</div>
                  <div className="text-sm text-white/80">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
                  alt="Students learning together"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border-2" style={{ borderColor: '#e6941f' }}>
                <div className="flex items-center space-x-3">
                  <Star className="h-6 w-6 fill-current" style={{ color: '#e6941f' }} />
                  <div>
                    <div className="font-bold text-xl" style={{ color: '#073045' }}>4.9/5</div>
                    <div className="text-sm text-gray-600">Parent Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#073045' }}>
              Why Parents Trust Edumentor
            </h2>
            <p className="text-xl text-gray-600 max-w-[800px] mx-auto">
              We're more than just a mentoring platform—we're your partner in your child's educational success
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#1d636c' }}>
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Personalized Learning</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every child learns differently. Our mentors create customized lesson plans that match your child's unique learning style and pace.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#e6941f' }}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#e6941f' }}>
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Verified Mentors</h3>
                <p className="text-gray-600 leading-relaxed">
                  All our mentors undergo rigorous screening and verification. Work with qualified professionals who are passionate about education.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#073045' }}>
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Track Progress</h3>
                <p className="text-gray-600 leading-relaxed">
                  Stay informed with regular progress reports and assessments. Watch your child's confidence and grades improve week by week.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#e6941f' }}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#e6941f' }}>
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Exam Focused</h3>
                <p className="text-gray-600 leading-relaxed">
                  Specialized preparation for JAMB, WAEC, Common Entrance, and other key Nigerian examinations with proven strategies.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#1d636c' }}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#1d636c' }}>
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Flexible Scheduling</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose between in-person and online sessions. Schedule lessons that fit your family's busy lifestyle.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderColor: '#073045' }}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#073045' }}>
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#073045' }}>Affordable Excellence</h3>
                <p className="text-gray-600 leading-relaxed">
                  Quality education shouldn't break the bank. We offer competitive rates with transparent pricing and no hidden fees.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Student Success Story */}
      <section id="success-stories" className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                alt="Students celebrating success"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 rounded-full" style={{ backgroundColor: '#e6941f', color: 'white' }}>
                <Sparkles className="inline h-4 w-4 mr-2" />
                <span className="font-semibold">Success Stories</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#073045' }}>
                Transforming Dreams into Reality
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Every year, thousands of Nigerian students achieve their academic goals with Edumentor. From gaining admission 
                to top universities to excelling in critical exams, our students consistently outperform expectations.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: '#1d636c' }} />
                  <p className="text-gray-700"><strong>89% of our JAMB students</strong> score above 250 in their UTME exams</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: '#1d636c' }} />
                  <p className="text-gray-700"><strong>95% pass rate</strong> for WAEC students with distinctions in core subjects</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: '#1d636c' }} />
                  <p className="text-gray-700"><strong>Hundreds of students</strong> admitted to their dream universities yearly</p>
                </div>
              </div>
              <Button onClick={() => scrollToSection('success-stories')} size="lg" className="mt-4 hover:opacity-90" style={{ backgroundColor: '#1d636c', color: 'white' }}>
                Read More Stories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#073045' }}>
              Getting Started is Easy
            </h2>
            <p className="text-xl text-gray-600 max-w-[800px] mx-auto">
              Three simple steps to connect with the perfect mentor for your child
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg" style={{ backgroundColor: '#1d636c' }}>
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>Create Your Profile</h3>
              <p className="text-gray-600 leading-relaxed">
                Tell us about your child's learning needs, goals, and preferred subjects. It takes just 2 minutes to get started.
              </p>
            </div>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg" style={{ backgroundColor: '#e6941f' }}>
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>Match with Mentors</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse verified mentor profiles, read reviews from other parents, and find the perfect match for your child's learning style.
              </p>
            </div>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg" style={{ backgroundColor: '#073045' }}>
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>Watch Them Excel</h3>
              <p className="text-gray-600 leading-relaxed">
                Schedule sessions, track progress, and celebrate as your child's grades improve and their confidence soars.
              </p>
            </div>
          </div>
        </div>
      </section>

    

      {/* CTA for Corps Members */}
      <section id="become-mentor" className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e6941f 0%, #d68516 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight text-white">
                Join Our Community of Educators
              </h2>
              <p className="text-xl text-white/95 max-w-[800px] mx-auto leading-relaxed">
                Are you a passionate NYSC corps member or experienced educator? Share your knowledge, 
                make a difference in students' lives, and earn competitive income on your schedule.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <Link href="/become-tutor" passHref>
                <Button  size="lg" className="w-full sm:w-auto text-lg px-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" style={{ backgroundColor: '#073045', color: 'white' }}>
                Become a Mentor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
   
  </Link>
             
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all">
                Learn More
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
              <div>
                <div className="text-3xl font-bold text-white">Flexible</div>
                <div className="text-white/90">Schedule</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">Competitive</div>
                <div className="text-white/90">Pay</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">Make Impact</div>
                <div className="text-white/90">Daily</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Benefits Section */}
      <section id="mentor-benefits" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#073045' }}>
              Benefits of Being a Mentor
            </h2>
            <p className="text-xl text-gray-600 max-w-[800px] mx-auto">
              Join a platform that values and supports educators
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Earn ₦50,000 - ₦200,000/month', desc: 'Set your own rates and work as much or as little as you want' },
              { title: 'Flexible Schedule', desc: 'Teach when it suits you - evenings, weekends, or during your free time' },
              { title: 'Professional Development', desc: 'Access to training resources and teaching materials' },
              { title: 'Build Your Reputation', desc: 'Gain reviews and grow your student base over time' },
              { title: 'Secure Payments', desc: 'Safe, reliable payment system with weekly payouts' },
              { title: 'Support Network', desc: 'Join a community of dedicated educators across Nigeria' }
            ].map((benefit, idx) => (
              <Card key={idx} className="border-2 hover:shadow-lg transition-all" style={{ borderColor: '#e6941f' }}>
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold" style={{ color: '#073045' }}>{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#073045' }}>
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-[800px] mx-auto">
              Have questions? We're here to help you get started
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold" style={{ color: '#073045' }}>Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1d636c' }}>
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#073045' }}>Email Us</h4>
                    <p className="text-gray-600">support@edumentor.ng</p>
                    <p className="text-gray-600">info@edumentor.ng</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e6941f' }}>
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#073045' }}>Call Us</h4>
                    <p className="text-gray-600">+234 800 123 4567</p>
                    <p className="text-gray-600">+234 801 234 5678</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#073045' }}>
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#073045' }}>Visit Us</h4>
                    <p className="text-gray-600">Off Naval Quarters</p>
                    <p className="text-gray-600">Kubwa, Abuja, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="border-2" style={{ borderColor: '#1d636c' }}>
              <CardContent className="p-6">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Thank you for your message! We will get back to you soon.'); }}>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#073045' }}>Name</label>
                    <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#1d636c' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#073045' }}>Email</label>
                    <input type="email" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#1d636c' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#073045' }}>Message</label>
                    <textarea required rows={4} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#1d636c' }}></textarea>
                  </div>
                  <Button type="submit" className="w-full text-white hover:opacity-90" style={{ backgroundColor: '#1d636c' }}>
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
   <footer className="border-t" style={{ backgroundColor: '#073045' }}>
  <div className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
    <div className="grid gap-8 md:grid-cols-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e6941f' }}>
            <Image 
              src="/edumentor-logo.png"
              alt="Edumentor Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </div>
          <span className="text-xl font-bold text-white">Edumentor</span>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          Empowering Nigerian students to achieve academic excellence through personalized, quality mentoring.
        </p>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-white">For Parents</h4>
        <div className="space-y-2 text-sm">
          <Link href="/tutors" className="block text-white/80 hover:text-white transition-colors text-left">
            Find Mentors
          </Link>
          <button onClick={() => scrollToSection('how-it-works')} className="block text-white/80 hover:text-white transition-colors text-left">
            How It Works
          </button>
          <button onClick={() => scrollToSection('success-stories')} className="block text-white/80 hover:text-white transition-colors text-left">
            Success Stories
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-white">For Mentors</h4>
        <div className="space-y-2 text-sm">
          <Link href="/become-tutor" className="block text-white/80 hover:text-white transition-colors text-left">
            Join as Mentor
          </Link>
          <button onClick={() => scrollToSection('mentor-benefits')} className="block text-white/80 hover:text-white transition-colors text-left">
            Benefits
          </button>
          <button onClick={() => scrollToSection('mentor-benefits')} className="block text-white/80 hover:text-white transition-colors text-left">
            Resources
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-white">Support</h4>
        <div className="space-y-2 text-sm">
          <button onClick={() => scrollToSection('about')} className="block text-white/80 hover:text-white transition-colors text-left">
            Help Center
          </button>
          <button onClick={() => scrollToSection('contact')} className="block text-white/80 hover:text-white transition-colors text-left">
            Contact Us
          </button>
          <button onClick={() => scrollToSection('home')} className="block text-white/80 hover:text-white transition-colors text-left">
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
    <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/80">
      <p>&copy; 2024 Edumentor. All rights reserved. Made with ❤️ for Nigerian students.</p>
    </div>
  </div>
</footer>
    </div>
  )
}