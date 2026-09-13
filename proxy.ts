// proxy.ts (renamed from middleware.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/login',
  '/register/student',
  '/register/teacher',
  '/register/parent',
  '/register/school',      // ← ADD (new school registration)
  '/features',
  '/schools',
  '/about',
  '/apply',                // ← Already covers /apply/school and /apply/status/*
  '/forgot-password',
];

export function proxy(request: NextRequest) {   // ← renamed from middleware
  const token = request.cookies.get('accessToken');
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check if it's a dashboard route
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};