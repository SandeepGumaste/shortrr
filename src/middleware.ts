import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { rateLimiter, urlRedirectLimiter } from '@/lib/rate-limit';
import { securityHeaders } from './middleware/security';

export default auth(async (req) => {
  const response = await handleRequest(req);
  
  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value as string);
  });
  
  return response;
});

async function handleRequest(req: any) {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isAuthPage = nextUrl.pathname.startsWith("/auth");
  const isLegalPage = nextUrl.pathname.startsWith("/legal");
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isRootPath = nextUrl.pathname === '/';
  
  // List of paths that should not be treated as short URLs
  const excludedPaths = ['/profile', '/api', '/auth', '/legal'];
  const isExcludedPath = excludedPaths.some(path => nextUrl.pathname.startsWith(path));
  
  const isShortUrl = !isExcludedPath && 
    !isRootPath &&
    nextUrl.pathname.split('/').length === 2;

  // Apply rate limiting for short URL redirects
  if (isShortUrl) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success, limit, reset, remaining } = await urlRedirectLimiter.limit(ip);

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }

    const shortId = nextUrl.pathname.slice(1);
    if (shortId) {
      return NextResponse.redirect(new URL(`/api/url/${shortId}`, nextUrl));
    }
  }

  // Apply general rate limiting for API routes
  if (isApiRoute && !isApiAuthRoute) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }

  // Allow access to legal pages without authentication
  if (isLegalPage) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    let from = nextUrl.pathname;
    if (nextUrl.search) {
      from += nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, nextUrl)
    );
  }

  return NextResponse.next();
}

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
