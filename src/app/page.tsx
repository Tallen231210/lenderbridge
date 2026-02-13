/**
 * Landing page — redirects authenticated users to their role-specific portal.
 * Uses useConvexAuth() instead of Clerk's useAuth() to ensure the JWT token
 * has been delivered to Convex before rendering, preventing a flash of the
 * landing page during the auth propagation gap.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/** Maps each role to its default dashboard */
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin/dashboard",
  partner: "/partner/dashboard",
  borrower: "/borrower/dashboard",
};

export default function LandingPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  // Redirect authenticated users to their portal
  useEffect(() => {
    if (authLoading || isLoading) return;

    if (isAuthenticated && user) {
      const dashboard = ROLE_DASHBOARDS[user.role];
      if (dashboard) {
        router.replace(dashboard);
      }
    }
  }, [isAuthenticated, authLoading, user, isLoading, router]);

  // Show loading while auth token is propagating or user record is resolving
  if (authLoading || (isAuthenticated && (isLoading || !user))) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-black sm:text-5xl tracking-tight">
          LenderBridge
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Commercial Loan Referral Platform
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Submit, track, and manage commercial loan deals with real-time
          pipeline visibility.
        </p>
        <div className="mt-8">
          <Link href="/sign-in">
            <Button size="lg" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
