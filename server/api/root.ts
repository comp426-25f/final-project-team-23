/**
 * Configuration for the server-side tRPC API, including the primary API router.
 * Configuration of the server-side tRPC API.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @license MIT
 * @see https://comp426-25f.github.io/
 */

import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { exampleApiRouter } from "./routers/example";
import { postsApiRouter } from "./routers/posts";
import { profilesApiRouter } from "./routers/profiles";
import { travelItineraryRouter } from "./routers/travelItinerary";

// [NOTE]
// To expose a new API, add a new router here.

/** Primary router for the API server. */
export const appRouter = createTRPCRouter({
  posts: postsApiRouter,
  // feed: feedRouter,
  profiles: profilesApiRouter,
  travel: travelItineraryRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
