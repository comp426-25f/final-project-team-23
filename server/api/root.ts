/**
 * Configuration for the server-side tRPC API, including the primary API router.
 * Configuration of the server-side tRPC API.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @license MIT
 * @see https://comp426-25f.github.io/
 */

import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { postsApiRouter } from "./routers/posts";
import { profilesApiRouter } from "./routers/profiles";
import { travelItineraryRouter } from "./routers/itineraries";
import { destinationsApiRouter } from "./routers/destinations";

// [NOTE]
// To expose a new API, add a new router here.

/** Primary router for the API server. */
export const appRouter = createTRPCRouter({
  posts: postsApiRouter,
  profiles: profilesApiRouter,
  itineraries: travelItineraryRouter,
  destinations: destinationsApiRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
