/**
 * Auth redirect page — routes authenticated users to their role-specific dashboard.
 * Middleware sends authenticated users here from the landing page so the landing
 * page content never renders. Shows a loading spinner while fetching the user's role.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin/dashboard",
  partner: "/partner/dashboard",
  borrower: "/borrower/dashboard",
};

export default function AuthRedirectPage() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      const dashboard = ROLE_DASHBOARDS[user.role] || "/";
      router.replace(dashboard);
    } else {
      // No user record found — send to landing page
      router.replace("/");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
}
