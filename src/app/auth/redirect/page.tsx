/**
 * Auth redirect page — routes authenticated users to their role-specific dashboard.
 *
 * Handles the webhook race condition: after Clerk signup, the Convex user record
 * may not exist yet (webhook is async). If the user is authenticated but has no
 * Convex record, we call ensureUser immediately to create it. The mutation is
 * idempotent (checks for existing record first), so it's safe even if the
 * webhook fires at the same time.
 *
 * Waits for both Convex auth (JWT propagation) and the user query before acting.
 * Shows a visible error if ensureUser fails instead of silently reloading.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin/dashboard",
  partner: "/partner/dashboard",
  borrower: "/borrower/dashboard",
};

export default function AuthRedirectPage() {
  const { user, isLoading } = useCurrentUser();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);
  const router = useRouter();
  const ensureFiredRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  // Timeout fallback — if nothing resolves in 15 seconds, show help
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Wait for both Convex auth (JWT) and user query to finish loading
    if (authLoading || isLoading) return;

    if (user) {
      // User record exists — route to their dashboard
      const dashboard = ROLE_DASHBOARDS[user.role] || "/";
      router.replace(dashboard);
    } else if (isAuthenticated && !ensureFiredRef.current) {
      // Authenticated but no Convex record — create it now.
      // ensureUser is idempotent: if the webhook already created the record,
      // it returns the existing ID. No delay needed.
      ensureFiredRef.current = true;
      ensureUser()
        .catch((err) => {
          // Show the error instead of reloading — prevents infinite reload loop
          console.error("ensureUser failed:", err);
          setError(
            err?.data?.message || err?.message || "Failed to set up account"
          );
        });
      // useQuery is reactive — once the record is created (by ensureUser or
      // the webhook), the query re-fires, user appears, and we redirect above.
    }
  }, [user, isLoading, authLoading, isAuthenticated, ensureUser, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-red-600">
            Account Setup Error
          </h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <a
            href="/sign-in"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Taking longer than expected
          </h2>
          <p className="mt-2 text-gray-600">
            Your account may still be setting up. Try signing in.
          </p>
          <a
            href="/sign-in"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
}
