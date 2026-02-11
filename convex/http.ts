/**
 * Convex HTTP router — defines HTTP endpoints accessible from outside Convex.
 * Currently used for the Clerk webhook endpoint with signature verification.
 */
import { httpRouter } from "convex/server";

const http = httpRouter();

// Note: Clerk webhooks are handled by the Next.js API route at
// /api/webhooks/clerk, not by Convex HTTP actions directly.
// This file is here for future HTTP action needs.

export default http;
