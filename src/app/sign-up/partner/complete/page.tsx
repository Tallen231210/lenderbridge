/**
 * Post-signup page for partner registration.
 * After Clerk signup completes, this page:
 * 1. Calls ensurePartnerRole to assign the "partner" role in Convex
 * 2. Redirects to the partner dashboard
 *
 * Handles the race condition where the Clerk webhook may not have fired yet
 * by creating the user directly if needed.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function PartnerSignUpCompletePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const ensurePartner = useMutation(api.users.ensurePartnerRole);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;

    const claimRole = async () => {
      try {
        await ensurePartner();
        if (!cancelled) {
          router.replace("/partner/dashboard");
        }
      } catch (err) {
        console.error("Failed to set up partner account:", err);
        if (!cancelled) {
          setError(true);
        }
      }
    };

    claimRole();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, ensurePartner, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-red-600">
            Something went wrong
          </h2>
          <p className="mt-2 text-gray-600">
            We couldn&apos;t set up your partner account. Please try signing in.
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">
          Setting up your partner account...
        </p>
      </div>
    </div>
  );
}
