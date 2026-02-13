/**
 * Landing page — redirects authenticated users to their role-specific portal.
 * Unauthenticated users see a simple landing with sign-in CTA.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
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
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  // Redirect authenticated users to their portal
  useEffect(() => {
    if (!authLoaded || isLoading) return;

    if (isSignedIn && user) {
      const dashboard = ROLE_DASHBOARDS[user.role];
      if (dashboard) {
        router.replace(dashboard);
      }
    }
  }, [isSignedIn, authLoaded, user, isLoading, router]);

  // Show loading while checking auth
  if (!authLoaded || (isSignedIn && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          LenderBridge
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Commercial Loan Referral Platform
        </p>
        <p className="mt-2 text-gray-500">
          Submit, track, and manage commercial loan deals with real-time
          pipeline visibility.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-in">
            <Button size="lg" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up/partner">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Join as Partner
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Borrower?{" "}
          <Link href="/sign-in" className="text-blue-500 hover:text-blue-600 underline">
            Check your deal status
          </Link>
        </p>
      </div>
    </div>
  );
}
