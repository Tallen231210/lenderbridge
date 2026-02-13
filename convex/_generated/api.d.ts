/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as commissions from "../commissions.js";
import type * as deals from "../deals.js";
import type * as errorLogs from "../errorLogs.js";
import type * as helpers_auth from "../helpers/auth.js";
import type * as helpers_errors from "../helpers/errors.js";
import type * as helpers_validation from "../helpers/validation.js";
import type * as http from "../http.js";
import type * as lenders from "../lenders.js";
import type * as notifications from "../notifications.js";
import type * as seedDemoData from "../seedDemoData.js";
import type * as seedLenders from "../seedLenders.js";
import type * as seedUsers from "../seedUsers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  commissions: typeof commissions;
  deals: typeof deals;
  errorLogs: typeof errorLogs;
  "helpers/auth": typeof helpers_auth;
  "helpers/errors": typeof helpers_errors;
  "helpers/validation": typeof helpers_validation;
  http: typeof http;
  lenders: typeof lenders;
  notifications: typeof notifications;
  seedDemoData: typeof seedDemoData;
  seedLenders: typeof seedLenders;
  seedUsers: typeof seedUsers;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
