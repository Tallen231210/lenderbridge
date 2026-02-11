/**
 * Convex auth configuration — integrates Clerk as the authentication provider.
 * The Clerk JWT issuer domain must be set as CLERK_JWT_ISSUER_DOMAIN in the
 * Convex dashboard environment variables (Settings > Environment Variables).
 *
 * To find your issuer domain: Clerk Dashboard > JWT Templates > convex
 * It looks like: https://your-app.clerk.accounts.dev
 */
const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN ?? "https://placeholder.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
