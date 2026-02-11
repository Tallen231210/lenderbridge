/**
 * Deal submission page — renders the multi-step DealSubmissionWizard.
 * Partners fill out loan info, property info, borrower info, then review and submit.
 * Target: under 90 seconds to complete.
 */
"use client";

import { DealSubmissionWizard } from "@/components/deals/DealSubmissionWizard";

export default function NewDealPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit New Deal</h1>
        <p className="text-gray-500 mt-1">
          Fill out the deal details below. It should take less than 2 minutes.
        </p>
      </div>
      <DealSubmissionWizard />
    </div>
  );
}
