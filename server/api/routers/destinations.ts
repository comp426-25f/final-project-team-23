import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Destination, Post } from "@/server/models/responses";
import {
  DraftPost,
  PaginationParams,
  PostIdentity,
} from "@/server/models/inputs";
import {
  postsTable,
  likesTable,
  followsTable,
  profilesTable,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const getAll = publicProcedure.output(Destination.array()).query(async () => {
  const destinations = await db.query.destinationsTable.findMany({
    orderBy: (t, { asc }) => [asc(t.country), asc(t.name)],
  });

  return Destination.array().parse(destinations);
});

export const destinationsApiRouter = createTRPCRouter({
  getAll: getAll,
});
