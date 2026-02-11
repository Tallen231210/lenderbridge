/**
 * Partner resources page — static educational content for referral partners.
 * FAQ, loan type guide, and tips for identifying commercial deal opportunities.
 * No dynamic data — purely informational to help partners submit quality deals.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PartnerResourcesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-500 mt-1">
          Guides and tips for submitting quality deals
        </p>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FaqItem
            question="How long does it take for a deal to close?"
            answer="Most commercial deals take 30-90 days from submission to close, depending on complexity. Bridge loans can close faster (2-4 weeks), while construction loans may take longer."
          />
          <FaqItem
            question="What commission rate should I expect?"
            answer="Standard referral commission is 0.5% of the loan amount. This may vary based on deal size, complexity, and your agreement with the broker."
          />
          <FaqItem
            question="When do I get paid?"
            answer="Commissions are paid after the deal closes and the broker receives their fee. Payment timing varies but is typically within 30 days of closing."
          />
          <FaqItem
            question="What happens if a deal falls through?"
            answer="If a deal is marked as dead or declined, any pending commission is automatically voided. This is reflected in your commission history."
          />
          <FaqItem
            question="Can I edit a deal after submission?"
            answer="Once submitted, deals cannot be edited by partners. Contact the broker directly if information needs to be corrected."
          />
        </CardContent>
      </Card>

      {/* Loan Type Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Commercial Loan Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LoanTypeItem
            type="Permanent"
            description="Long-term financing (5-30 years) for stabilized, income-producing properties. Lowest rates, strictest qualification."
          />
          <LoanTypeItem
            type="Bridge"
            description="Short-term financing (6-36 months) to bridge a gap — common for acquisitions, repositioning, or lease-up periods. Higher rates, faster close."
          />
          <LoanTypeItem
            type="Construction"
            description="Finances ground-up construction or major renovation. Released in draws as milestones are met. Converts to permanent loan upon completion."
          />
          <LoanTypeItem
            type="Land"
            description="Finances raw land acquisition for future development. Higher rates and lower LTV due to increased risk."
          />
          <LoanTypeItem
            type="SBA"
            description="Small Business Administration loans (504/7a) for owner-occupied commercial property. Government-backed, lower down payment."
          />
        </CardContent>
      </Card>

      {/* How to Spot a Deal */}
      <Card>
        <CardHeader>
          <CardTitle>How to Spot a Commercial Deal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>
            <strong className="text-gray-900">Investor clients buying rental properties:</strong>{" "}
            Anyone purchasing 5+ unit multifamily, retail centers, office buildings, or industrial properties.
          </p>
          <p>
            <strong className="text-gray-900">Business owners buying their space:</strong>{" "}
            Dentists, car washes, restaurants, medical offices — if they want to own instead of lease.
          </p>
          <p>
            <strong className="text-gray-900">Refinance conversations:</strong>{" "}
            Existing commercial property owners looking to lower their rate, pull cash out, or restructure debt.
          </p>
          <p>
            <strong className="text-gray-900">Construction and development:</strong>{" "}
            Anyone planning to build — apartments, warehouses, mixed-use, or converting existing buildings.
          </p>
          <p className="pt-2 text-gray-500 italic">
            When in doubt, submit the deal. It takes less than 2 minutes and the broker will evaluate whether it fits.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/** FAQ accordion-style item */
function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="border-b border-gray-100 pb-3 last:border-0">
      <h4 className="text-sm font-medium text-gray-900">{question}</h4>
      <p className="text-sm text-gray-600 mt-1">{answer}</p>
    </div>
  );
}

/** Loan type description item */
function LoanTypeItem({
  type,
  description,
}: {
  type: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-sm font-semibold text-blue-600 min-w-[100px]">
        {type}
      </span>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
