import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.clipsflow.com, demo.localhost:3000)
  let hostname = req.headers.get('host') || 'localhost:3000';

  // For local development, remove the port
  hostname = hostname.replace(/:\d+$/, '');

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // If it's a global path (auth pages, etc.), don't rewrite
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup') || url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // If it's the root domain (e.g., clipsflow.com or localhost), render standard pages (marketing, auth, superadmin)
  if (hostname === 'localhost' || hostname === 'clipsflow.com') {
    return NextResponse.next();
  }

  // Otherwise it's a tenant subdomain (e.g., agency1.clipsflow.com)
  const subdomain = hostname.split('.')[0];
  console.log(`[Middleware] Hostname: ${hostname} | Subdomain: ${subdomain} | Path: ${path}`);
  
  // If the path already includes the /app/subdomain prefix (e.g. from a hardcoded link), strip it so we don't double-prefix
  let normalizedPath = path;
  if (path.startsWith(`/app/${subdomain}`)) {
    normalizedPath = path.substring(`/app/${subdomain}`.length);
    if (normalizedPath === '') normalizedPath = '/';
  }

  const rewriteUrl = new URL(`/app/${subdomain}${normalizedPath === '/' ? '' : normalizedPath}`, req.url);
  console.log(`[Middleware] Rewriting to: ${rewriteUrl.toString()}`);
  return NextResponse.rewrite(rewriteUrl);
}
