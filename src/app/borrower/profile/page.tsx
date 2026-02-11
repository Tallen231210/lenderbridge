/**
 * Borrower profile page — simple contact info view and update.
 * Borrowers can update their phone number. Email and name managed by Clerk.
 * Intentionally minimal — borrowers have a simplified, read-focused experience.
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
import { toast } from "sonner";

export default function BorrowerProfilePage() {
  const { user, isLoading } = useCurrentUser();
  const updateProfile = useMutation(api.users.updateProfile);

  const [phone, setPhone] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (user && !initialized) {
    setPhone(user.phone || "");
    setInitialized(true);
  }

  if (isLoading || !user) {
    return <PageSkeleton />;
  }

  async function handleSave() {
    try {
      await updateProfile({ phone: phone || undefined });
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
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-500">Name</Label>
            <p className="text-sm font-medium">{user.name}</p>
          </div>
          <div>
            <Label className="text-gray-500">Email</Label>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
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
