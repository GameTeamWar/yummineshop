import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth gerektiren sayfalar
  const protectedPaths = ['/admin', '/store', '/courier', '/profile'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtected) {
    // Burada Firebase auth kontrolü yapabiliriz, ama client-side olduğu için
    // Sayfa içinde kontrol edilecek
    // Şimdilik basit redirect
    const token = request.cookies.get('firebase-auth-token');
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};