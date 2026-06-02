import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

let cachedMaintenanceMode: boolean | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10000; // 10 seconds cache

async function getMaintenanceMode(origin: string) {
  const now = Date.now();
  if (cachedMaintenanceMode !== null && now - cacheTimestamp < CACHE_TTL) {
    return cachedMaintenanceMode;
  }
  try {
    const res = await fetch(`${origin}/api/site-config`, {
      next: { revalidate: 10 },
    });
    if (res.ok) {
      const data = await res.json();
      cachedMaintenanceMode = data.maintenanceMode;
      cacheTimestamp = now;
      return cachedMaintenanceMode;
    }
  } catch (error) {
    console.error('Error fetching maintenance mode in middleware:', error);
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const origin = req.nextUrl.origin;

  // 1. Check Maintenance Mode
  const isMaintenance = await getMaintenanceMode(origin);
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = token?.role === 'ADMIN';

  // If in maintenance mode, redirect non-admins to /maintenance
  if (isMaintenance && !isAdmin) {
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/explore') ||
      pathname.startsWith('/templates')
    ) {
      if (pathname !== '/maintenance') {
        return NextResponse.redirect(new URL('/maintenance', req.url));
      }
    }
  }

  // If NOT in maintenance mode but trying to access /maintenance, redirect to home
  if (!isMaintenance && pathname === '/maintenance') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 2. Authentication & Authorization Gates
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/explore/:path*',
    '/templates/:path*',
    '/maintenance',
  ],
};
