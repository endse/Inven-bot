import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
  
  const token = request.cookies.get('session')?.value;
  const session = await verifyToken(token);

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing login/register while logged in
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (session && path.startsWith('/admin')) {
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/review', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
