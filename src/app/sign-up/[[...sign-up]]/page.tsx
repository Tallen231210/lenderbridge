/**
 * Sign-up page — uses Clerk's pre-built SignUp component.
 * General signup flow — role is assigned based on invite or admin action.
 *
 * Handles the already-signed-in case: after Clerk completes signup and signs
 * the user in, this page detects the signed-in state and redirects to
 * /auth/redirect instead of trying to render the SignUp component (which
 * can't render when a user is already signed in).
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // After Clerk signup completes, the user is signed in — redirect immediately
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/auth/redirect");
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render the SignUp form if already authenticated
  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp
        forceRedirectUrl="/auth/redirect"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
