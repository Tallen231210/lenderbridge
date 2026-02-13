/**
 * Partner-specific signup page.
 * Referral partners (realtors, loan officers) sign up here to get the
 * "partner" role automatically, instead of the default "borrower" role.
 * After Clerk signup completes, redirects to /sign-up/partner/complete
 * which assigns the partner role in Convex.
 */
import { SignUp } from "@clerk/nextjs";

export default function PartnerSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Join LenderBridge
          </h1>
          <p className="mt-1 text-sm text-blue-600 font-medium">
            Referral Partner Registration
          </p>
          <p className="mt-3 text-gray-600 text-sm">
            Create your account to start submitting commercial loan deals
            and earning referral commissions.
          </p>
        </div>
        <SignUp
          forceRedirectUrl="/sign-up/partner/complete"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-lg w-full",
            },
          }}
        />
      </div>
    </div>
  );
}
