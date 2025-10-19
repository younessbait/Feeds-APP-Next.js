import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const APP_SECRET = new TextEncoder().encode(process.env.APP_SECRET!);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isApi = pathname.startsWith('/api');
  const isLoginApi = pathname === '/api/auth/login';
  const isProtectedPage = pathname.startsWith('/choose') || pathname.startsWith('/dashboard') || pathname.startsWith('/posts');
  const isLoginPage = pathname === '/login';

  // Public: login API
  if (isApi && isLoginApi) return NextResponse.next();

  const token = req.cookies.get('session')?.value;
  const hasValid = token ? await verifyToken(token) : false;

  // If logged in and visiting /login, redirect to /choose
  if (isLoginPage && hasValid) {
    return NextResponse.redirect(new URL('/choose', req.url));
  }

  // Protect all other APIs and protected pages
  if ((isApi && !isLoginApi) || isProtectedPage) {
    if (!hasValid) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

async function verifyToken(token: string) {
  try {
    await jwtVerify(token, APP_SECRET);
    return true;
  } catch {
    return false;
  }
}

export const config = { matcher: ['/login', '/choose/:path*', '/dashboard/:path*', '/posts/:path*', '/api/:path*'] };
