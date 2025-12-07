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
import { itinerariesApiRouter } from "./routers/trips";
import { groupChatsApiRouter } from "./routers/groupChats";

// [NOTE]
// To expose a new API, add a new router here.

/** Primary router for the API server. */
export const appRouter = createTRPCRouter({
  groupChats: groupChatsApiRouter,
  posts: postsApiRouter,
  profiles: profilesApiRouter,
  itineraries: travelItineraryRouter,
  destinations: destinationsApiRouter,
  trips: itinerariesApiRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
