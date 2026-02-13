/**
 * Sign-in page — uses Clerk's pre-built SignIn component.
 * Redirects already-authenticated users to the landing page (which then
 * routes them to their role-specific dashboard) to avoid a brief flash
 * of the sign-in form after login.
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
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render the sign-in form if already authenticated
  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn
        forceRedirectUrl="/"
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
