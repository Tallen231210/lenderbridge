/**
 * Hook that redirects users to the correct portal based on their role.
 * Used in route group layouts to enforce role-based access.
 * If a partner tries to access /admin/*, they get redirected to /partner/dashboard.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "./useCurrentUser";

/** Maps each role to its default portal dashboard */
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin/dashboard",
  partner: "/partner/dashboard",
  borrower: "/borrower/dashboard",
};

export function useRequireRole(requiredRole: "admin" | "partner" | "borrower") {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // No user record yet — they may be new and webhook hasn't fired
    if (!user) return;

    // Wrong role — redirect to their correct portal
    if (user.role !== requiredRole) {
      const correctDashboard =
        ROLE_DASHBOARDS[user.role] || "/";
      router.replace(correctDashboard);
    }
  }, [user, isLoading, requiredRole, router]);

  return { user, isLoading, isAuthorized: user?.role === requiredRole };
}
