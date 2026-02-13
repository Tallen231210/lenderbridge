/**
 * Sign-in page — uses Clerk's pre-built SignIn component.
 * After authentication, Clerk redirects to /auth/redirect which routes
 * users to their role-specific dashboard. Already-signed-in users are
 * sent there immediately to avoid showing the sign-in form.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/auth/redirect");
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render the sign-in form if already authenticated
  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <SignIn
        forceRedirectUrl="/auth/redirect"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
            // Hide the "Don't have an account? Sign up" footer link.
            // Users are invited via shared links, not public self-registration.
            footerAction: "hidden",
          },
        }}
      />
    </div>
  );
}
