/**
 * Clerk webhook handler — receives user events from Clerk and syncs to Convex.
 * SECURITY: Verifies webhook signature via svix before processing any event.
 * Without signature verification, anyone could send fake user creation events.
 *
 * Events handled:
 * - user.created: Creates a new user record in Convex
 * - user.updated: Updates the user's name/email in Convex
 */
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
  }

  // SECURITY: Extract svix headers for signature verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  // SECURITY: Verify webhook signature before processing.
  // Without this, anyone could send fake user creation events.
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Process verified webhook event
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

    if (email) {
      const userId = await convex.mutation(api.users.createUser, {
        email,
        name,
        clerk_id: id,
        // Default to borrower role — admin manually promotes to partner/admin
        role: "borrower",
      });

      // Auto-link the new borrower to any deals submitted with their email.
      // This enables the invite-based onboarding flow: partner submits deal with
      // borrower's email → borrower signs up via invite link → deals auto-link.
      if (userId) {
        await convex.mutation(api.users.linkBorrowerToDeals, { userId });
      }
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

    if (email) {
      await convex.mutation(api.users.updateUserByClerkId, {
        clerk_id: id,
        email,
        name,
      });
    }
  }

  return new Response("Webhook processed", { status: 200 });
}
