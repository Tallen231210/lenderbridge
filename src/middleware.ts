/**
 * Clerk authentication middleware — protects all routes except public ones.
 * Redirects authenticated users from the landing page to /auth/redirect,
 * which handles role-based routing client-side. This prevents any flash of
 * the landing page content after sign-in.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/redirect",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/log-error",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Redirect authenticated users away from the landing page
  if (request.nextUrl.pathname === "/" && userId) {
    return NextResponse.redirect(new URL("/auth/redirect", request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
