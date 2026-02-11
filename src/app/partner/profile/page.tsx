/**
 * Partner profile page — view and update contact information.
 * Partners can update phone, company, and license number.
 * Email and name are managed through Clerk. Commission rate is admin-set and read-only.
 */
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPercent } from "@/lib/utils";
import { toast } from "sonner";

export default function PartnerProfilePage() {
  const { user, isLoading } = useCurrentUser();
  const updateProfile = useMutation(api.users.updateProfile);

  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [license, setLicense] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize form with current user data once loaded
  if (user && !initialized) {
    setPhone(user.phone || "");
    setCompany(user.company || "");
    setLicense(user.license_number || "");
    setInitialized(true);
  }

  if (isLoading || !user) {
    return <PageSkeleton />;
  }

  async function handleSave() {
    try {
      await updateProfile({
        phone: phone || undefined,
        company: company || undefined,
        license_number: license || undefined,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Read-only fields managed by Clerk */}
          <div>
            <Label className="text-gray-500">Name</Label>
            <p className="text-sm font-medium">{user.name}</p>
          </div>
          <div>
            <Label className="text-gray-500">Email</Label>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
          {user.commission_rate && (
            <div>
              <Label className="text-gray-500">Commission Rate</Label>
              <p className="text-sm font-medium text-green-600">
                {formatPercent(user.commission_rate)}
              </p>
            </div>
          )}

          {/* Editable fields */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company name"
            />
          </div>
          <div>
            <Label htmlFor="license">License / NMLS Number</Label>
            <Input
              id="license"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              placeholder="RE license or NMLS ID"
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
