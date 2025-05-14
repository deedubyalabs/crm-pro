import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // DEV MODE: Authentication checks are disabled
  return NextResponse.next()

  /*
  const authToken = request.cookies.get("auth_token")?.value
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/auth/login", "/auth/signup", "/auth/reset-password", "/auth/update-password"]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // If no auth token and not a public path, redirect to login
  if (!authToken) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Otherwise, allow access
  return NextResponse.next()
  */
}

export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files
    // - Public files
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
