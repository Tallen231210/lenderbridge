/**
 * Deal submission wizard — multi-step form for partners to submit new deals.
 * Steps: Loan Info → Property Info → Borrower Info → Review & Submit
 * Client-side validation via zod on each step, server-side re-validation in Convex mutation.
 * Target: under 90 seconds to complete for a motivated salesperson.
 */
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { toast } from "sonner";
import {
  dealStep1Schema,
  dealStep2Schema,
  dealStep3Schema,
  type DealFormValues,
} from "@/lib/validators";
import {
  LOAN_TYPES,
  TRANSACTION_TYPES,
  LOAN_POSITIONS,
  PROPERTY_TYPES,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = ["Loan Info", "Property Info", "Borrower Info", "Review & Submit"];

export function DealSubmissionWizard() {
  const router = useRouter();
  const handleError = useErrorHandler();
  const createDeal = useMutation(api.deals.createDeal);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state — all fields in one object for easy review step display
  const [formData, setFormData] = useState<Partial<DealFormValues>>({
    loan_position: "first", // Smart default
  });

  /** Update a single field */
  const updateField = (field: keyof DealFormValues, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /** Validate the current step and advance if valid */
  const handleNext = () => {
    const schemas = [dealStep1Schema, dealStep2Schema, dealStep3Schema];
    if (currentStep < 3) {
      const schema = schemas[currentStep];
      const result = schema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setErrors(fieldErrors);
        return;
      }
    }
    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  /** Submit the deal to Convex */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createDeal({
        borrower_name: formData.borrower_name || "",
        borrower_email: formData.borrower_email || undefined,
        borrower_phone: formData.borrower_phone || undefined,
        borrower_company: formData.borrower_company || undefined,
        property_address: formData.property_address || "",
        property_type: formData.property_type || "",
        transaction_type: formData.transaction_type || "",
        loan_type: formData.loan_type || "",
        loan_amount: formData.loan_amount || 0,
        loan_position: formData.loan_position || undefined,
        notes: formData.notes || undefined,
      });
      toast.success("Deal submitted successfully!");
      router.push("/partner/deals");
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`text-xs font-medium ${
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep + 1}: {STEPS[currentStep]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Loan Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="loan_type">Loan Type *</Label>
                <Select
                  value={formData.loan_type || ""}
                  onValueChange={(v) => updateField("loan_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.loan_type && (
                  <p className="text-sm text-red-500 mt-1">{errors.loan_type}</p>
                )}
              </div>

              <div>
                <Label htmlFor="loan_amount">Loan Amount *</Label>
                <Input
                  id="loan_amount"
                  type="number"
                  placeholder="e.g., 1500000"
                  value={formData.loan_amount || ""}
                  onChange={(e) =>
                    updateField("loan_amount", Number(e.target.value))
                  }
                />
                {formData.loan_amount && formData.loan_amount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(formData.loan_amount)}
                  </p>
                )}
                {errors.loan_amount && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.loan_amount}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="transaction_type">Transaction Type *</Label>
                <Select
                  value={formData.transaction_type || ""}
                  onValueChange={(v) => updateField("transaction_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.transaction_type && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.transaction_type}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="loan_position">Loan Position</Label>
                <Select
                  value={formData.loan_position || "first"}
                  onValueChange={(v) => updateField("loan_position", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_POSITIONS.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Property Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="property_address">Property Address *</Label>
                <Input
                  id="property_address"
                  placeholder="123 Main St, City, State, ZIP"
                  value={formData.property_address || ""}
                  onChange={(e) =>
                    updateField("property_address", e.target.value)
                  }
                />
                {errors.property_address && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.property_address}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="property_type">Property Type *</Label>
                <Select
                  value={formData.property_type || ""}
                  onValueChange={(v) => updateField("property_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.property_type && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.property_type}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Borrower Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="borrower_name">Borrower Name *</Label>
                <Input
                  id="borrower_name"
                  placeholder="Full name"
                  value={formData.borrower_name || ""}
                  onChange={(e) =>
                    updateField("borrower_name", e.target.value)
                  }
                />
                {errors.borrower_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.borrower_name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="borrower_email">Borrower Email</Label>
                <Input
                  id="borrower_email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.borrower_email || ""}
                  onChange={(e) =>
                    updateField("borrower_email", e.target.value)
                  }
                />
                {errors.borrower_email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.borrower_email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="borrower_phone">Borrower Phone</Label>
                <Input
                  id="borrower_phone"
                  placeholder="(555) 123-4567"
                  value={formData.borrower_phone || ""}
                  onChange={(e) =>
                    updateField("borrower_phone", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="borrower_company">Borrower Company</Label>
                <Input
                  id="borrower_company"
                  placeholder="Company name (optional)"
                  value={formData.borrower_company || ""}
                  onChange={(e) =>
                    updateField("borrower_company", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Loan Type</p>
                  <p className="font-medium capitalize">
                    {formData.loan_type?.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Loan Amount</p>
                  <p className="font-medium text-green-600 text-lg">
                    {formData.loan_amount
                      ? formatCurrency(formData.loan_amount)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Transaction Type</p>
                  <p className="font-medium capitalize">
                    {formData.transaction_type?.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Loan Position</p>
                  <p className="font-medium capitalize">
                    {formData.loan_position?.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Property Address</p>
                  <p className="font-medium">{formData.property_address}</p>
                </div>
                <div>
                  <p className="text-gray-500">Property Type</p>
                  <p className="font-medium capitalize">
                    {formData.property_type?.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Borrower Name</p>
                  <p className="font-medium">{formData.borrower_name}</p>
                </div>
                {formData.borrower_email && (
                  <div>
                    <p className="text-gray-500">Borrower Email</p>
                    <p className="font-medium">{formData.borrower_email}</p>
                  </div>
                )}
                {formData.borrower_phone && (
                  <div>
                    <p className="text-gray-500">Borrower Phone</p>
                    <p className="font-medium">{formData.borrower_phone}</p>
                  </div>
                )}
                {formData.borrower_company && (
                  <div>
                    <p className="text-gray-500">Borrower Company</p>
                    <p className="font-medium">{formData.borrower_company}</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional details for the broker..."
                  value={formData.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Deal"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
