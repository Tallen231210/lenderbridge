/**
 * Error telemetry endpoint — bridges client-side ErrorBoundary to Convex error_logs table.
 * No authentication required because errors can occur before a user is signed in.
 * Called by ErrorBoundary.componentDidCatch() when a React rendering error is caught.
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await convex.mutation(api.errorLogs.logError, {
      error_message: body.error_message || "Unknown error",
      error_stack: body.error_stack,
      component_stack: body.component_stack,
      page: body.page || "/unknown",
      user_agent: body.user_agent,
      timestamp: body.timestamp || Date.now(),
    });

    return new Response("Error logged", { status: 200 });
  } catch (err) {
    // Never let telemetry failures return 5xx — log and return 200
    console.error("Failed to log error to Convex:", err);
    return new Response("Error logging failed silently", { status: 200 });
  }
}
