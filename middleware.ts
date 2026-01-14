import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/about', '/packages', '/tutors', '/become-tutor'];
  
  // Auth routes (should redirect if already logged in)
  const authRoutes = ['/login', '/register'];
  
  // Student routes (require student role)
  const studentRoutes = [
    
    '/dashboard/messages'
  ];
  
  // Tutor routes (require tutor role)
  const tutorRoutes = [
  
    '/tutor-dashboard/schedule'
  ];

  // Protected routes (require any authentication)
  const protectedRoutes = [...studentRoutes, ...tutorRoutes];

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If user is not authenticated and trying to access protected route
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access auth route
  if (token && isAuthRoute) {
    // Get user role from cookie or redirect to appropriate dashboard
    // For now, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};